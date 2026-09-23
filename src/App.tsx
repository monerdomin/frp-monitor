import { useState } from "react"
import { Header } from "@/components/Header"
import { StatsBar } from "@/components/StatsBar"
import { ServerTable, type Filter } from "@/components/ServerTable"
import { LogPanel } from "@/components/LogPanel"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGrid } from "@/lib/useGrid"
import { SERVERS } from "@/lib/servers"
import { timeAgo } from "@/lib/format"
import { cn } from "cn"

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "SITE", label: "SITE" },
  { key: "TELEGRAM", label: "TELEGRAM" },
]

export default function App() {
  const scanStart = useState(() => Date.now())[0]
  const grid = useGrid(scanStart)
  const [filter, setFilter] = useState<Filter>("ALL")

  return (
    <div className="relative min-h-screen">
      <div className="app-scanlines" aria-hidden />
      <div className="relative z-10">
        <Header mode={grid.mode} />

        <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-5 sm:px-6">
          <StatsBar status={grid.status} />

          <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_336px]">
            {/* nodes */}
            <section className="cyber-corners relative flex flex-col border border-border/80 bg-card/50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-primary">[00]</span>
                  <h2 className="font-display text-sm font-bold tracking-[0.28em] text-foreground">AUTH GRID</h2>
                  <span className="hidden font-mono text-[10px] tracking-[0.16em] text-muted-foreground sm:inline">
                    {SERVERS.length} NODES · {grid.status.nodes.filter((n) => n.status === "online").length + grid.status.nodes.filter((n) => n.status === "degraded").length} REACHABLE
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn("font-mono text-[10px] tracking-[0.18em]", grid.mode === "live" ? "text-ok" : "text-warn")}>
                    {grid.mode === "live" ? "LIVE DROP" : "SAFE MODE"}
                  </span>
                  <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} orientation="horizontal">
                    <TabsList variant="line" className="font-mono text-[10px] tracking-[0.14em]">
                      {FILTERS.map((f) => (
                        <TabsTrigger key={f.key} value={f.key}>
                          {f.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="flex-1">
                <ServerTable status={grid.status} filter={filter} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                <span>
                  SYNCED <span className="text-foreground/80">{timeAgo(grid.lastSync)}</span> · POLL 6S · TIMEOUT 5S
                </span>
                <span className="text-muted-foreground/70">
                  SRC: gsmauth.com · radexfrp.com · falconfrptool.com · fastfrptool.com · mifrp.com · mifrptool.com · bestauthtool.com · tfmtool.com · xiaomiauth.org · t.me
                </span>
              </div>
            </section>

            <LogPanel status={grid.status} scanningFor={grid.scanningFor} />
          </div>

          <footer className="border-t border-border/60 pt-3 pb-4 font-mono text-[10px] leading-relaxed tracking-[0.14em] text-muted-foreground/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                NETDECK // FRP GRID TELEMETRY — CREDIT-SERVED AUTH ENDPOINTS FOR SERVICE PROFESSIONALS. PRICES ARE RESELLER
                SNAPSHOTS ($/CR) AND SHIFT FREQUENTLY.
              </span>
              <span className="tabular-nums">© 2077 NIGHT CITY NETWORK</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}