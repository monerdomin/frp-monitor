import { SERVERS, type GridStatus, type NodeStatus } from "@/lib/servers"
import { priceOf, timeAgo } from "@/lib/format"
import { StatusBadge, STATUS_META } from "@/components/Status"
import { Sparkline } from "@/components/Sparkline"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "cn"

export type Filter = "ALL" | "SITE" | "TELEGRAM"

const TIER_COLOR = {
  budget: "text-ok",
  mid: "text-cyan",
  premium: "text-primary",
} as const

const BAR_ON = "[&>div]:bg-ok"
const BAR_WARN = "[&>div]:bg-warn"
const BAR_OFF = "[&>div]:bg-danger"

function NodeStatusFor(map: Map<string, NodeStatus>, serverId: string): NodeStatus | undefined {
  return map.get(serverId)
}

export function ServerTable({ status, filter }: { status: GridStatus; filter: Filter }) {
  const nodeMap = new Map(status.nodes.map((n) => [n.id, n]))
  const servers = SERVERS.filter((s) => (filter === "ALL" ? true : s.source === filter))

  return (
    <TooltipProvider delayDuration={120}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px] pl-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
              NODE
            </TableHead>
            <TableHead className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
              TARGET
            </TableHead>
            <TableHead className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">STATUS</TableHead>
            <TableHead className="text-right font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
              PRICE / CR
            </TableHead>
            <TableHead className="text-right font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
              LATENCY
            </TableHead>
            <TableHead className="w-[110px] font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
              UPTIME 24H
            </TableHead>
            <TableHead className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">CHECK</TableHead>
            <TableHead className="pr-3 font-mono text-[10px] tracking-[0.22em] text-muted-foreground">TREND</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servers.map((server) => {
            const node = NodeStatusFor(nodeMap, server.id)
            const live = node?.status ?? "offline"
            const meta = STATUS_META[live]
            const dim = live === "offline"
            return (
              <TableRow key={server.id} className={cn("group", dim && "opacity-45")}>
                {/* node */}
                <TableCell className="pl-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("h-7 w-[3px] shrink-0", meta.bar)} />
                    <div className="min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block cursor-help truncate font-display text-sm font-semibold tracking-wide text-foreground">
                            {server.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] border-border bg-popover font-sans text-xs text-popover-foreground">
                          {server.note ?? "Credit-based auth server."}
                          <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {server.endpoint}
                            {server.telegram ? ` · ${server.telegram}` : ""}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                        <span className="border border-border/70 px-1 py-px text-[9px]">
                          {server.source === "SITE" ? "SITE" : "TG"}
                        </span>
                        {server.vendor}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* target */}
                <TableCell className="max-w-[190px]">
                  <a
                    href={server.endpoint}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-mono text-[11px] text-muted-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary"
                  >
                    {server.telegram ?? server.endpoint.replace(/^https?:\/\//, "")}
                  </a>
                </TableCell>

                <TableCell>
                  <StatusBadge status={live} />
                </TableCell>

                <TableCell className="text-right">
                  <div className={cn("font-mono text-sm tabular-nums", TIER_COLOR[server.tier])}>
                    {priceOf(server)}
                  </div>
                  {server.min && (
                    <div className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">{server.min}</div>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {live === "offline" ? (
                    <span className="font-mono text-xs text-muted-foreground">——</span>
                  ) : (
                    <span className={cn("inline-flex items-center justify-end gap-1.5 font-mono text-xs tabular-nums", meta.text)}>
                      {node?.latency ?? "—"}
                      <span className="text-muted-foreground">ms</span>
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-9 font-mono text-xs tabular-nums", meta.text)}>
                      {(node?.uptime24 ?? 99.2).toFixed(1)}
                    </span>
                    <span className="inline-block w-14">
                      <Progress
                        value={node?.uptime24 ?? 99.2}
                        className={cn(
                          "h-1",
                          live === "online" ? BAR_ON : live === "degraded" ? BAR_WARN : BAR_OFF
                        )}
                      />
                    </span>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {node ? timeAgo(node.lastChecked) : "—"}
                </TableCell>

                <TableCell className="pr-3 text-right">
                  <div className="flex justify-end" title="latency trend · last 25 probes">
                    <Sparkline data={node?.history ?? [120]} stroke={meta.bar === "bg-ok" ? "oklch(0.78 0.17 152)" : meta.bar === "bg-warn" ? "oklch(0.8 0.14 82)" : "oklch(0.62 0.205 24)"} />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  )
}