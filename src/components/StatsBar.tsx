import type { GridStatus } from "@/lib/servers"
import { SERVERS } from "@/lib/servers"
import { cn } from "cn"

function Stat({
  label,
  value,
  unit,
  accent,
  dim,
}: {
  label: string
  value: string
  unit?: string
  accent?: "ok" | "warn" | "danger" | "cyan"
  dim?: boolean
}) {
  const color =
    accent === "ok"
      ? "text-ok"
      : accent === "warn"
        ? "text-warn"
        : accent === "danger"
          ? "text-danger"
          : accent === "cyan"
            ? "text-cyan"
            : "text-foreground"
  return (
    <div className="cyber-corners-tl relative border border-border/80 bg-card/50 px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className={cn("font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl", color, dim && "opacity-30")}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  )
}

export function StatsBar({ status }: { status: GridStatus }) {
  const nodes = status.nodes
  const online = nodes.filter((n) => n.status === "online").length
  const degraded = nodes.filter((n) => n.status === "degraded").length
  const offline = nodes.filter((n) => n.status === "offline").length

  const priced = SERVERS.filter((s) => s.pricePerCredit != null)
  const avg = priced.length ? priced.reduce((a, s) => a + (s.pricePerCredit ?? 0), 0) / priced.length : 0

  return (
    <section aria-label="grid summary" className="grid grid-cols-2 gap-px sm:grid-cols-3 xl:grid-cols-5">
      <Stat label="NODES TRACKED" value={String(SERVERS.length)} />
      <Stat label="ONLINE" value={String(online + degraded)} accent="ok" />
      <Stat label="DEGRADED" value={String(degraded)} accent="warn" dim={degraded === 0} />
      <Stat label="OFFLINE" value={String(offline)} accent="danger" dim={offline === 0} />
      <Stat label="AVG PRICE / CREDIT" value={avg.toFixed(3)} unit="$" accent="cyan" />
    </section>
  )
}