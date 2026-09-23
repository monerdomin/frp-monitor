import { useEffect, useState } from "react"
import { clockNow } from "@/lib/format"
import { cn } from "cn"

export function Header({ mode }: { mode: "live" | "sim" }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="relative z-10 border-b border-border bg-card/40 backdrop-blur-sm">
      <div className="tick-corner max-w-[1440px] mx-auto flex items-center justify-between gap-6 px-4 py-3 sm:px-6">
        {/* brand */}
        <div className="flex items-center gap-4">
          <div className="relative flex size-9 items-center justify-center border border-primary/50 bg-primary/10">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
              <path d="M4 12l5-6v4h10v4H9v4l-5-6Z" fill="var(--primary)" />
            </svg>
          </div>
          <div>
            <div className="flex items-baseline gap-3">
              <h1
                className="glitch-word font-display text-xl font-bold tracking-[0.28em] text-primary text-glow-yellow sm:text-2xl"
                data-text="NETDECK"
              >
                NETDECK
              </h1>
              <span className="hidden font-mono text-[10px] tracking-[0.2em] text-muted-foreground sm:inline">
                //FRP_GRID_MONITOR
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
              REMOTE AUTH SERVERS · PRICE &amp; UPTIME TELEMETRY · v1.2.6
            </p>
          </div>
        </div>

        {/* clock + mode */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <div className="blinking-cursor font-mono text-lg text-foreground tabular-nums">
              {clockNow(now)}
            </div>
            <div className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
              {now.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-2 border px-3 py-1 font-mono text-[10px] tracking-[0.22em]",
              mode === "live"
                ? "border-ok/40 bg-ok/10 text-ok"
                : "border-warn/40 bg-warn/10 text-warn"
            )}
          >
            <span className={cn("relative inline-flex size-1.5 rounded-full", mode === "live" ? "bg-ok" : "bg-warn", "status-live")} />
            {mode === "live" ? "LIVE" : "SIM"}
          </span>
        </div>
      </div>
      <div className="h-[3px] w-full bg-gradient-to-r from-primary via-primary/40 to-transparent" />
    </header>
  )
}