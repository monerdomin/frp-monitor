import type { FrpServer } from "./servers"

export function priceOf(s: FrpServer): string {
  if (s.pricePerCredit == null) return s.priceLabel
  return `$${s.pricePerCredit.toFixed(s.pricePerCredit >= 1 ? 2 : 3)}`
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 5) return "just now"
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ${m % 60}m ago`
}

export function clockNow(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}