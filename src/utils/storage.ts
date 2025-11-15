import { Campaign } from '@/types'

const STORAGE_KEY = 'campaign-intelligence-hub-data'

export const storage = {
  saveCampaigns: (campaigns: Campaign[]) => {
    try {
      const serialized = JSON.stringify(campaigns, (key, value) => {
        // Convert Date objects to ISO strings
        if (value instanceof Date) {
          return value.toISOString()
        }
        return value
      })
      localStorage.setItem(STORAGE_KEY, serialized)
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  },

  loadCampaigns: (): Campaign[] => {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY)
      if (!serialized) return []
      
      const campaigns = JSON.parse(serialized, (key, value) => {
        // Convert ISO strings back to Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value)
        }
        return value
      })
      
      return campaigns
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      return []
    }
  },

  exportCampaigns: (campaigns: Campaign[]): string => {
    return JSON.stringify(campaigns, null, 2)
  },

  importCampaigns: (jsonString: string): Campaign[] | null => {
    try {
      const campaigns = JSON.parse(jsonString, (key, value) => {
        // Convert ISO strings back to Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value)
        }
        return value
      })
      
      // Validate that it's an array of campaigns
      if (!Array.isArray(campaigns)) {
        throw new Error('Invalid format: expected an array')
      }
      
      return campaigns
    } catch (error) {
      console.error('Error importing campaigns:', error)
      return null
    }
  },

  clearCampaigns: () => {
    localStorage.removeItem(STORAGE_KEY)
  }
}
