import { useId } from "react"

export function Sparkline({
  data,
  stroke,
  width = 96,
  height = 28,
}: {
  data: number[]
  stroke: string
  width?: number
  height?: number
}) {
  const id = useId()
  if (data.length < 2) return <svg width={width} height={height} aria-hidden />
  const pad = 3
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const point = (i: number) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = height - pad - ((data[i] - min) / span) * (height - pad * 2)
    return { x, y }
  }
  const pts = data.map((_, i) => (() => { const { x, y } = point(i); return `${x.toFixed(1)},${y.toFixed(1)}` })())
  const last = point(data.length - 1)
  const grad = `spark-${id}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pts.join(" ")} ${width - pad},${height - pad} ${pad},${height - pad}`}
        fill={`url(#${grad})`}
      />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last.x} cy={last.y} r="2" fill={stroke} />
    </svg>
  )
}