import { writeFile, readFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HOST_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HOST_DIR, "..")
const STATE_FILE = path.join(HOST_DIR, "state.json")
const OUT_DIR = path.join(ROOT, "public", "api")
const OUT_FILE = path.join(OUT_DIR, "status.json")

const SAMPLE_TTL_MS = 24 * 60 * 60 * 1000
const HISTORY_LEN = 25
const SITE_TIMEOUT = 7000
const TG_TIMEOUT = 9000

/** live probes replicated from src/lib/servers.ts */
const TARGETS = [
  { id: "gsm-auth", kind: "SITE", target: "https://gsmauth.com/serverstatus.php" },
  { id: "radex", kind: "SITE", target: "https://radexfrp.com" },
  { id: "falcon", kind: "SITE", target: "https://falconfrptool.com" },
  { id: "fast-frp", kind: "SITE", target: "https://fastfrptool.com" },
  { id: "mifrp", kind: "SITE", target: "https://mifrp.com" },
  { id: "mifrptool", kind: "SITE", target: "https://mifrptool.com" },
  { id: "best-auth", kind: "SITE", target: "https://bestauthtool.com" },
  { id: "tfm", kind: "SITE", target: "https://beta.tfmtool.com/server-status" },
  { id: "anonymous", kind: "SITE", target: "https://xiaomiauth.org" },
  { id: "phoenix", kind: "SITE", target: "https://phoenixservicetool.com/index.php", telegram: "PhoenixServiceToolUpdates" },
  { id: "soul-auth", kind: "SITE", target: "https://soulauth.com", telegram: "soulauth" },
  { id: "frp-boss", kind: "TELEGRAM", channel: "frpbosstool" },
]

async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, "utf8"))
  } catch {
    return { samples: {}, history: {} }
  }
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
}

function classifySite(body) {
  const low = body.toLowerCase()
  if (/maintenance/i.test(low)) return "degraded"
  if (/server (is )?(down|offline|unavailable)|is down/i.test(low)) return "offline"
  return "online"
}

function classifyTelegram(msgs) {
  if (msgs.length === 0) return "offline"
  const recent = msgs.slice(0, 3).join(" ").toLowerCase()
  if (/maintenance|under update/i.test(recent)) return "degraded"
  if (/offline|server (is )?down|not available/i.test(recent)) return "offline"
  return "online"
}

function telegramMessages(body) {
  const blocks = body.match(/class="tgme_widget_message_text"[^>]*>[\s\S]*?<\/div>/g) ?? []
  return blocks.map((b) => stripTags(b)).filter(Boolean).slice(0, 6).reverse()
}

async function probe(url, timeoutMs) {
  const start = performance.now()
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    })
    const body = await res.text()
    return { ok: res.status >= 200 && res.status < 400, ms: Math.round(performance.now() - start), body }
  } catch {
    return { ok: false, ms: 0, body: "" }
  }
}

async function main() {
  const state = await loadState()
  const now = Date.now()
  const events = []
  const collected = new Map() // id -> { site?, tg? }

  for (const t of TARGETS) {
    if (t.kind === "SITE") {
      const ping = await probe(t.target, SITE_TIMEOUT)
      const rec = collected.get(t.id) ?? { id: t.id }
      rec.site = {
        status: ping.ok ? classifySite(ping.body) : "offline",
        latency: ping.ok ? ping.ms : 0,
        note: ping.ok ? "" : `probe failed (${ping.ok ? "no body" : "unreachable"})`,
      }
      collected.set(t.id, rec)
      events.push({
        ts: now,
        text: `${t.id} · site:${rec.site.status} · ${rec.site.latency ? `${rec.site.latency}ms` : "—"}`,
        level: rec.site.status,
      })

      if (t.telegram) {
        const tgPing = await probe(`https://t.me/s/${t.telegram}`, TG_TIMEOUT)
        if (tgPing.ok) {
          const msgs = telegramMessages(tgPing.body)
          rec.tg = { status: classifyTelegram(msgs), latency: tgPing.ms, msgs: msgs.length }
        }
      }
    } else {
      const ping = await probe(`https://t.me/s/${t.channel}`, TG_TIMEOUT)
      const msgs = ping.ok ? telegramMessages(ping.body) : []
      collected.set(t.id, { id: t.id, tg: { status: classifyTelegram(msgs), latency: ping.ok ? ping.ms : 0, msgs: msgs.length } })
      events.push({
        ts: now,
        text: `${t.id} · tg:${t.channel} · ${ping.ok ? classifyTelegram(msgs) : "offline"} · ${msgs.length} msgs`,
        level: ping.ok ? classifyTelegram(msgs) : "offline",
      })
    }
  }

  const nodes = []
  for (const rec of collected.values()) {
    // primary source = site, telegram is a supplementary live signal
    const primary = rec.site ?? rec.tg
    // if site unreachable but telegram heartbeat alive → report site status as-is (honest about endpoint)

    const id = rec.id
    const samples = state.samples[id] ?? []
    samples.push({ ok: primary.status !== "offline", ts: now })
    state.samples[id] = samples.filter((s) => now - s.ts < SAMPLE_TTL_MS)

    const window = state.samples[id]
    const uptime24 = window.length ? Math.round((window.filter((s) => s.ok).length / window.length) * 1000) / 10 : 100

    const history = state.history[id] ?? []
    if (rec.site || (rec.tg && !rec.site)) history.push(primary.latency)
    state.history[id] = history.slice(-HISTORY_LEN)

    nodes.push({
      id,
      status: primary.status,
      latency: primary.status === "offline" ? 0 : primary.latency,
      uptime24,
      lastChecked: now,
      history: state.history[id],
      sources: rec.tg ? 2 : 1,
    })
  }

  const online = nodes.filter((n) => n.status === "online").length
  events.push({
    ts: now,
    text: `grid poll · ${nodes.length} nodes · ${online} reachable · ${events.length - 1} probes`,
    level: "online",
  })

  const grid = { mode: "live", generatedAt: now, pollMs: 60000, nodes, events: events.slice(-24) }

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(OUT_FILE, JSON.stringify(grid, null, 2))
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2))

  console.log(`[netdeck] wrote status.json — ${online}/${nodes.length} online`)
}

main().catch((e) => {
  console.error("[netdeck] scan failed:", e)
  process.exitCode = 1
})