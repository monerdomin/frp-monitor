export type Source = "SITE" | "TELEGRAM"
export type Category = "XIAOMI" | "MULTI" | "SAMSUNG"
export type ServerStatus = "online" | "degraded" | "offline"

export interface FrpServer {
  id: string
  name: string
  vendor: string
  source: Source
  endpoint: string
  telegram?: string
  category: Category
  tier: "budget" | "mid" | "premium"
  pricePerCredit?: number
  priceLabel: string
  min?: string
  note?: string
}

export const SERVERS: FrpServer[] = [
  {
    id: "gsm-auth",
    name: "Gsm Auth Tool",
    vendor: "gsmauth.com",
    source: "SITE",
    endpoint: "https://gsmauth.com/serverstatus.php",
    category: "XIAOMI",
    tier: "mid",
    priceLabel: "12 cr / unlock",
    note: "Xiaomi FRP reset — Assistant Mode",
  },
  {
    id: "radex",
    name: "RADEX FRP",
    vendor: "radexfrp.com",
    source: "SITE",
    endpoint: "https://radexfrp.com",
    category: "MULTI",
    tier: "mid",
    pricePerCredit: 0.998,
    priceLabel: "0.998",
  },
  {
    id: "falcon",
    name: "Falcon FRP Tool",
    vendor: "falconfrptool.com",
    source: "SITE",
    endpoint: "https://falconfrptool.com",
    category: "MULTI",
    tier: "budget",
    pricePerCredit: 0.79,
    priceLabel: "0.79",
  },
  {
    id: "fast-frp",
    name: "Fast FRP Tool",
    vendor: "fastfrptool.com",
    source: "SITE",
    endpoint: "https://fastfrptool.com",
    category: "MULTI",
    tier: "budget",
    pricePerCredit: 0.95,
    priceLabel: "0.95",
    note: "Realme OTP / MTK+QC",
  },
  {
    id: "mifrp",
    name: "mifrp tool",
    vendor: "mifrp.com",
    source: "SITE",
    endpoint: "https://mifrp.com",
    category: "XIAOMI",
    tier: "budget",
    pricePerCredit: 0.95,
    priceLabel: "0.95",
  },
  {
    id: "mifrptool",
    name: "MIFRPTOOL.COM",
    vendor: "mifrptool.com",
    source: "SITE",
    endpoint: "https://mifrptool.com",
    category: "XIAOMI",
    tier: "budget",
    pricePerCredit: 0.949,
    priceLabel: "0.949",
  },
  {
    id: "best-auth",
    name: "Best Auth Tool",
    vendor: "bestauthtool.com",
    source: "SITE",
    endpoint: "https://bestauthtool.com",
    category: "XIAOMI",
    tier: "premium",
    pricePerCredit: 1.208,
    priceLabel: "1.208",
  },
  {
    id: "tfm",
    name: "TFM Tool Pro",
    vendor: "tfmtool",
    source: "SITE",
    endpoint: "https://beta.tfmtool.com/server-status",
    category: "MULTI",
    tier: "mid",
    pricePerCredit: 1.0,
    priceLabel: "1.00",
    min: "min 5",
    note: "vivo-auth + Samsung FRP",
  },
  {
    id: "anonymous",
    name: "Anonymous Tool",
    vendor: "xiaomiauth.org",
    source: "SITE",
    endpoint: "https://xiaomiauth.org",
    category: "XIAOMI",
    tier: "budget",
    pricePerCredit: 0.39,
    priceLabel: "0.39",
  },
  {
    id: "frp-boss",
    name: "FRP Boss Tool",
    vendor: "@frpbosstool",
    source: "TELEGRAM",
    endpoint: "https://t.me/s/frpbosstool",
    telegram: "t.me/s/frpbosstool",
    category: "SAMSUNG",
    tier: "budget",
    pricePerCredit: 0.9,
    priceLabel: "0.90",
    min: "min 10",
    note: "Samsung / Xiaomi / Nokia HMD / Honor",
  },
  {
    id: "phoenix",
    name: "Phoenix Service Tool",
    vendor: "phoenixservicetool.com",
    source: "SITE",
    endpoint: "https://phoenixservicetool.com/index.php",
    telegram: "t.me/s/PhoenixServiceToolUpdates",
    category: "MULTI",
    tier: "budget",
    pricePerCredit: 0.925,
    priceLabel: "0.925",
    note: "SAM FRP 7s · Samsung/Nokia/OPPO/Realme/OnePlus",
  },
  {
    id: "soul-auth",
    name: "Soul Auth Tool",
    vendor: "soulauth.com",
    source: "SITE",
    endpoint: "https://soulauth.com",
    telegram: "t.me/s/soulauth",
    category: "XIAOMI",
    tier: "mid",
    pricePerCredit: 0.983,
    priceLabel: "0.983",
    note: "FRP 5cr · FB2EDL · MTK/QC CPID",
  },
]

export interface NodeStatus {
  id: string
  status: ServerStatus
  latency: number
  uptime24: number
  lastChecked: number
  history: number[]
}

export interface GridStatus {
  mode: "live" | "sim"
  generatedAt: number
  nodes: NodeStatus[]
  events: { ts: number; text: string; level: ServerStatus }[]
}