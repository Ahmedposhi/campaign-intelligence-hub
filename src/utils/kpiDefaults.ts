import type { KPI } from '@/types'

export function generateDefaultKPIs(objective: string, channels: string[]): KPI[] {
  const kpis: KPI[] = []
  
  // Map objectives to KPIs
  const objectiveKPIs: Record<string, KPI[]> = {
    'lead-generation': [
      { name: 'MQLs Generated', target: 500, current: 0, unit: 'leads' },
      { name: 'Conversion Rate', target: 5, current: 0, unit: '%' },
      { name: 'Cost Per Lead', target: 50, current: 0, unit: '$' }
    ],
    'brand-awareness': [
      { name: 'Website Traffic', target: 50000, current: 0, unit: 'visitors' },
      { name: 'Social Media Impressions', target: 500000, current: 0, unit: 'impressions' },
      { name: 'Brand Mentions', target: 1000, current: 0, unit: 'mentions' }
    ],
    'product-launch': [
      { name: 'Product Signups', target: 1000, current: 0, unit: 'signups' },
      { name: 'Early Adopters', target: 500, current: 0, unit: 'users' },
      { name: 'Press Coverage', target: 50, current: 0, unit: 'articles' }
    ],
    'customer-retention': [
      { name: 'Customer Retention Rate', target: 95, current: 0, unit: '%' },
      { name: 'Email Engagement Rate', target: 25, current: 0, unit: '%' },
      { name: 'Support Ticket Resolution', target: 90, current: 0, unit: '%' }
    ],
    'thought-leadership': [
      { name: 'Content Views', target: 100000, current: 0, unit: 'views' },
      { name: 'Speaking Engagements', target: 5, current: 0, unit: 'events' },
      { name: 'Media Mentions', target: 20, current: 0, unit: 'mentions' }
    ]
  }

  // Get base KPIs from objective
  const baseKPIs = objectiveKPIs[objective] || [
    { name: 'Campaign Engagement', target: 10000, current: 0, unit: 'interactions' },
    { name: 'Conversion Rate', target: 5, current: 0, unit: '%' },
    { name: 'Return on Investment', target: 300, current: 0, unit: '%' }
  ]

  // Add channel-specific KPI if applicable
  const channelKPI: Record<string, KPI> = {
    'LinkedIn': { name: 'LinkedIn Followers Growth', target: 5000, current: 0, unit: 'followers' },
    'Email': { name: 'Email Open Rate', target: 35, current: 0, unit: '%' },
    'Content Marketing': { name: 'Content Downloads', target: 1000, current: 0, unit: 'downloads' },
    'Webinars': { name: 'Webinar Registrations', target: 500, current: 0, unit: 'registrations' },
    'Paid Search': { name: 'Cost Per Click', target: 2.5, current: 0, unit: '$' },
    'Display Ads': { name: 'Click Through Rate', target: 1.5, current: 0, unit: '%' },
    'SEO': { name: 'Organic Traffic Growth', target: 30, current: 0, unit: '%' }
  }

  // Start with the 3 base KPIs from objective
  kpis.push(...baseKPIs.slice(0, 3))

  return kpis
}
