import { SERVERS, type FrpServer, type GridStatus, type NodeStatus, type ServerStatus } from "./servers"

/* deterministic PRNG seeded per-server so demo data is stable across renders */
function seeded(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return ((h >>> 0) % 997) / 997
}

function latencyFor(id: string): number {
  const base = 120 + seeded(id) * 420
  const jitter = Math.sin(Date.now() / 4000 + seeded(id) * 40) * 0.08 + 0.05
  return Math.round(base * (1 + jitter))
}

function demoTick(server: FrpServer): NodeStatus {
  const r = seeded(server.id)
  const bucket = Math.floor(Date.now() / 180_000)
  const outage = Math.floor(r * 8) // 0..7
  const hz = (Math.imul(31, bucket) + Math.floor(r * 1e6)) >>> 0
  const roll = ((hz % 997) / 997) * 100
  let status: ServerStatus = "online"
  if (outage === 2 && roll > 92) status = "degraded"
  if (outage === 5 && roll > 96) status = "offline"
  if (outage === 7 && roll > 88) status = "degraded"

  const uptimeSeed = Math.floor(r * 97)
  const uptime24 = status === "offline" ? 91.4 : Math.min(99.9, 96 + uptimeSeed * 0.04)
  const latency = status === "offline" ? 0 : latencyFor(server.id)

  const history: number[] = []
  for (let i = 0; i < 24; i++) {
    const wob = Math.sin(i / 2.3 + r * 30) * 35 + seeded(server.id + i) * 60
    history.push(Math.max(40, Math.round((120 + r * 420 + wob) * 0.9)))
  }
  history.push(latency)

  return {
    id: server.id,
    status,
    latency,
    uptime24,
    lastChecked: Date.now(),
    history,
  }
}

export function demoStatus(): GridStatus {
  const nodes = SERVERS.map(demoTick)
  const offline = nodes.filter((n) => n.status !== "online").length
  const ts = Date.now()
  const status: ServerStatus = offline === 0 ? "online" : offline >= 2 ? "offline" : "degraded"
  const events = [
    { ts: ts - 30_000, text: `grid poll · ${SERVERS.length} endpoints · ${nodes.length - offline} ok`, level: status },
    { ts: ts - 90_000, text: "telegram relays: @soulauth · @PhoenixServiceToolUpdates · @frpbosstool", level: "degraded" as ServerStatus },
    { ts: ts - 150_000, text: "price cache loaded · 12 records · 0 revisions", level: status },
  ]
  return { mode: "sim", generatedAt: ts, nodes, events }
}

async function fetchJson(url: string, timeoutMs = 5000): Promise<GridStatus | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" })
    clearTimeout(t)
    if (!res.ok) return null
    const json = (await res.json()) as GridStatus
    if (!Array.isArray(json.nodes) || json.nodes.length === 0) return null
    return json
  } catch {
    return null
  }
}

const URLS = ["/api/status.json", "/status.json"]

export async function loadStatus(): Promise<GridStatus> {
  for (const u of URLS) {
    const real = await fetchJson(u)
    if (real) return real
  }
  return demoStatus()
}