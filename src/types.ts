export interface Campaign {
  id: string
  name: string
  objective: string
  targetAudience: string
  budget: number
  startDate: Date
  endDate: Date
  channels: string[]
  kpis: KPI[]
  content: ContentItem[]
  status: 'planning' | 'active' | 'paused' | 'completed'
}

export interface KPI {
  name: string
  target: number
  current: number
  unit: string
}

export interface ContentItem {
  id: string
  title: string
  type: string
  channel: string
  scheduledDate: Date
  status: 'draft' | 'scheduled' | 'published'
}

export interface ROIMetrics {
  totalInvestment: number
  revenue: number
  leads: number
  conversions: number
  roi: number
  cpl: number
  cac: number
}
