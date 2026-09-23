import type { ServerStatus } from "@/lib/servers"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

export const STATUS_META: Record<
  ServerStatus,
  { label: string; text: string; border: string; bg: string; dot: string; bar: string }
> = {
  online: {
    label: "ONLINE",
    text: "text-ok",
    border: "border-ok/30",
    bg: "bg-ok/8",
    dot: "bg-ok",
    bar: "bg-ok",
  },
  degraded: {
    label: "DEGRADED",
    text: "text-warn",
    border: "border-warn/30",
    bg: "bg-warn/10",
    dot: "bg-warn",
    bar: "bg-warn",
  },
  offline: {
    label: "OFFLINE",
    text: "text-danger",
    border: "border-danger/30",
    bg: "bg-danger/10",
    dot: "bg-danger",
    bar: "bg-danger",
  },
}

export function StatusBadge({ status }: { status: ServerStatus }) {
  const m = STATUS_META[status]
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-[0.18em]", m.border, m.bg, m.text)}
    >
      <span className={cn("relative inline-flex size-1.5 rounded-full", m.dot, status === "online" && "status-live")} />
      {m.label}
    </Badge>
  )
}

export function StatusDot({ status }: { status: ServerStatus }) {
  const m = STATUS_META[status]
  return <span className={cn("relative inline-flex size-1.5 shrink-0 rounded-full", m.dot, status === "online" && "status-live")} />
}