import { useCallback, useEffect, useRef, useState } from "react"
import type { GridStatus } from "./servers"
import { demoStatus, loadStatus } from "./status"

export interface GridController {
  status: GridStatus
  mode: "live" | "sim"
  lastSync: number
  scanningFor: number
  refresh(): void
}

export function useGrid(scanStart: number): GridController {
  const [status, setStatus] = useState<GridStatus>(() => demoStatus())
  const [mode, setMode] = useState<"live" | "sim">("sim")
  const [scanningFor, setScanningFor] = useState(0)
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    const next = await loadStatus()
    if (!mounted.current) return
    const isLive = next.mode === "live"
    setMode(isLive ? "live" : "sim")
    setStatus(next)
    setScanningFor(Math.floor((Date.now() - scanStart) / 1000))
  }, [scanStart])

  useEffect(() => {
    mounted.current = true
    void refresh()
    const id = setInterval(() => {
      void refresh()
    }, 6000)
    return () => {
      mounted.current = false
      clearInterval(id)
    }
  }, [refresh])

  return { status, mode, lastSync: status.generatedAt, scanningFor, refresh }
}