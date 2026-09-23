import { useEffect, useRef } from "react"
import type { GridStatus } from "@/lib/servers"
import { SERVERS } from "@/lib/servers"
import { clockNow, priceOf } from "@/lib/format"
import { StatusDot, STATUS_META } from "@/components/Status"
import { cn } from "cn"

const LEVEL_CLASS: Record<string, string> = {
  online: "text-ok",
  degraded: "text-warn",
  offline: "text-danger",
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/70 px-4 py-2.5">
      <span className="font-mono text-[10px] tracking-[0.2em] text-primary">{index}</span>
      <span className="font-display text-xs font-semibold tracking-[0.24em] text-foreground">{title}</span>
      <div className="mono-rule h-px flex-1" />
    </div>
  )
}

export function LogPanel({ status, scanningFor }: { status: GridStatus; scanningFor: number }) {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [status.events.length])

  const s = (n: number) => String(n).padStart(2, "0")
  const elapsed = `${s(Math.floor(scanningFor / 3600))}:${s(Math.floor((scanningFor % 3600) / 60))}:${s(scanningFor % 60)}`

  const cheapest = [...SERVERS]
    .filter((srv) => srv.pricePerCredit != null)
    .sort((a, b) => (a.pricePerCredit ?? 0) - (b.pricePerCredit ?? 0))
    .slice(0, 4)

  const onMap = new Map(status.nodes.map((n) => [n.id, n.status]))

  return (
    <aside className="flex flex-col gap-4">
      {/* relay log */}
      <section className="cyber-corners relative border border-border/80 bg-card/50">
        <SectionTitle index="[01]" title="RELAY LOG" />
        <div
          ref={scroller}
          className="log-scroll h-[264px] overflow-y-auto px-4 py-3 font-mono text-[11px] leading-[1.7]"
          aria-label="monitoring events"
        >
          {status.events.map((e, i) => (
            <div key={`${e.ts}-${i}`} className="flex gap-2 whitespace-nowrap">
              <span className="text-muted-foreground/70">[{clockNow(new Date(e.ts))}]</span>
              <StatusDot status={e.level} />
              <span className={cn("truncate", LEVEL_CLASS[e.level] ?? "text-foreground/80")}>{e.text}</span>
            </div>
          ))}
          <div className="mt-2 flex gap-2 text-muted-foreground/70">
            <span>──</span>
            <span>session open · polling every 6s · listen…</span>
            <span className="blinking-cursor" />
          </div>
        </div>
      </section>

      {/* price watch */}
      <section className="cyber-corners relative border border-border/80 bg-card/50">
        <SectionTitle index="[02]" title="PRICE WATCH" />
        <ul className="divide-y divide-border/50 px-4">
          {cheapest.map((srv) => {
            const st = onMap.get(srv.id) ?? "offline"
            return (
              <li key={srv.id} className="flex items-center gap-3 py-2.5">
                <StatusDot status={st} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xs font-semibold text-foreground">{srv.name}</div>
                  <div className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                    {srv.vendor.toUpperCase()} · {srv.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("font-mono text-sm tabular-nums", STATUS_META[st].text)}>{priceOf(srv)}</div>
                  <div className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">/ CREDIT</div>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="border-t border-border/70 px-4 py-2.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
          <span className="text-warn">+1 PENDING</span> — BD XIAOMI AUTH · $0.399/CR
          <br />
          awaiting channel link to enable probe
        </div>
      </section>

      {/* uptime strip */}
      <section className="cyber-corners-tl border border-border/80 bg-card/40 px-4 py-2.5">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          <span>SCAN ELAPSED</span>
          <span className="tabular-nums text-foreground">{elapsed}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          <span>DATA SOURCE</span>
          <span className={status.mode === "live" ? "text-ok" : "text-warn"}>
            {status.mode === "live" ? "live feed" : "simulation"}
          </span>
        </div>
      </section>
    </aside>
  )
}