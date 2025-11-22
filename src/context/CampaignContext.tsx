import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Campaign } from '@/types'

interface CampaignContextType {
  campaigns: Campaign[]
  setCampaigns: (campaigns: Campaign[]) => void
  selectedCampaign: Campaign | null
  setSelectedCampaign: (campaign: Campaign | null) => void
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  return (
    <CampaignContext.Provider value={{ campaigns, setCampaigns, selectedCampaign, setSelectedCampaign }}>
      {children}
    </CampaignContext.Provider>
  )
}

export const useCampaignContext = () => {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaignContext must be used within a CampaignProvider')
  }
  return context
}
