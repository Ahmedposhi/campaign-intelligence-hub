import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import CampaignWizard from '@/components/CampaignWizard'
import CampaignDashboard from '@/components/CampaignDashboard'
import CampaignSelector from '@/components/CampaignSelector'
import ContentCalendar from '@/components/ContentCalendar'
import ROICalculator from '@/components/ROICalculator'
import { Campaign } from '@/types'
import { storage } from '@/utils/storage'
import { Sparkles, LayoutDashboard, Calendar, Calculator, Download, Upload, Save, Trash2, FolderOpen } from 'lucide-react'

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load campaigns from localStorage on mount
  useEffect(() => {
    const loadedCampaigns = storage.loadCampaigns()
    if (loadedCampaigns.length > 0) {
      setCampaigns(loadedCampaigns)
      setActiveCampaign(loadedCampaigns[loadedCampaigns.length - 1])
      toast.success(`Loaded ${loadedCampaigns.length} campaign${loadedCampaigns.length !== 1 ? 's' : ''}`)
    }
  }, [])

  // Auto-save campaigns to localStorage whenever they change
  useEffect(() => {
    if (campaigns.length > 0) {
      storage.saveCampaigns(campaigns)
    }
  }, [campaigns])

  const handleCampaignCreate = (campaign: Campaign) => {
    const newCampaigns = [...campaigns, campaign]
    setCampaigns(newCampaigns)
    setActiveCampaign(campaign)
    toast.success('Campaign created and saved!')
  }

  const handleUpdateCampaign = (updatedCampaign: Campaign) => {
    const newCampaigns = campaigns.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    )
    setCampaigns(newCampaigns)
    setActiveCampaign(updatedCampaign)
    toast.success('Campaign updated!')
  }

  const handleDeleteCampaign = (campaignId: string) => {
    const newCampaigns = campaigns.filter(c => c.id !== campaignId)
    setCampaigns(newCampaigns)
    if (activeCampaign?.id === campaignId) {
      setActiveCampaign(newCampaigns.length > 0 ? newCampaigns[newCampaigns.length - 1] : null)
    }
  }

  const handleSelectCampaign = (campaign: Campaign) => {
    setActiveCampaign(campaign)
    toast.success(`Switched to: ${campaign.name}`)
  }

  const handleExport = () => {
    const json = storage.exportCampaigns(campaigns)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaigns-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Campaigns exported successfully!')
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const imported = storage.importCampaigns(content)
      
      if (imported) {
        setCampaigns(imported)
        storage.saveCampaigns(imported)
        if (imported.length > 0) {
          setActiveCampaign(imported[imported.length - 1])
        }
        toast.success(`Imported ${imported.length} campaign${imported.length !== 1 ? 's' : ''}!`)
      } else {
        toast.error('Failed to import campaigns. Invalid file format.')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all campaigns? This cannot be undone.')) {
      setCampaigns([])
      setActiveCampaign(null)
      storage.clearCampaigns()
      toast.success('All campaigns cleared')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      
      <div className="container mx-auto p-6 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Campaign Intelligence Hub
                </h1>
                <p className="text-slate-600 text-sm">AI-powered B2B marketing campaign planner</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-4 py-2">
                {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import campaigns"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={campaigns.length === 0}
                  title="Export campaigns"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={campaigns.length === 0}
                  title="Clear all campaigns"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          {campaigns.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Save className="w-4 h-4" />
              <span>Auto-saved to browser storage</span>
            </div>
          )}
        </header>

        <Tabs defaultValue="wizard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="wizard" className="flex items-center gap-2 py-3">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2 py-3">
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Manage</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 py-3">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2 py-3">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">ROI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wizard" className="space-y-6">
            <CampaignWizard onCampaignCreate={handleCampaignCreate} />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <CampaignSelector
              campaigns={campaigns}
              activeCampaign={activeCampaign}
              onSelectCampaign={handleSelectCampaign}
              onUpdateCampaign={handleUpdateCampaign}
              onDeleteCampaign={handleDeleteCampaign}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {campaigns.length > 0 ? (
              <CampaignDashboard 
                campaigns={campaigns} 
                activeCampaign={activeCampaign}
                onUpdateCampaign={handleUpdateCampaign}
              />
            ) : (
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle>No campaigns yet</CardTitle>
                  <CardDescription>
                    Create your first campaign using the wizard to get started
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <ContentCalendar 
              campaign={activeCampaign}
              onUpdateCampaign={handleUpdateCampaign}
            />
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <ROICalculator campaign={activeCampaign} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
