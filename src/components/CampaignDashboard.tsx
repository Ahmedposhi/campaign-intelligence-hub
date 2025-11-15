import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Campaign, KPI } from '@/types'
import { TrendingUp, Users, DollarSign, Target, Calendar, Edit, Plus, Trash2, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface CampaignDashboardProps {
  campaigns: Campaign[]
  activeCampaign: Campaign | null
  onUpdateCampaign: (campaign: Campaign) => void
}

const CampaignDashboard = ({ campaigns, activeCampaign, onUpdateCampaign }: CampaignDashboardProps) => {
  const campaign = activeCampaign || campaigns[campaigns.length - 1]
  const [editingKPI, setEditingKPI] = useState<string | null>(null)
  const [kpiValue, setKpiValue] = useState<number>(0)
  const [isAddingKPI, setIsAddingKPI] = useState(false)
  const [isEditingKPIDetails, setIsEditingKPIDetails] = useState<KPI | null>(null)
  const [newKPI, setNewKPI] = useState({
    name: '',
    target: 0,
    unit: ''
  })

  const handleUpdateKPIValue = (kpiName: string) => {
    const updatedCampaign = {
      ...campaign,
      kpis: campaign.kpis.map(kpi => 
        kpi.name === kpiName ? { ...kpi, current: kpiValue } : kpi
      )
    }
    onUpdateCampaign(updatedCampaign)
    setEditingKPI(null)
    toast.success('KPI value updated')
  }

  const handleAddKPI = () => {
    if (!newKPI.name || !newKPI.unit) {
      toast.error('Please fill in all fields')
      return
    }

    const kpi: KPI = {
      name: newKPI.name,
      target: newKPI.target,
      current: 0,
      unit: newKPI.unit
    }

    const updatedCampaign = {
      ...campaign,
      kpis: [...campaign.kpis, kpi]
    }

    onUpdateCampaign(updatedCampaign)
    setIsAddingKPI(false)
    setNewKPI({ name: '', target: 0, unit: '' })
    toast.success('KPI added')
  }

  const handleUpdateKPIDetails = () => {
    if (!isEditingKPIDetails) return

    const updatedCampaign = {
      ...campaign,
      kpis: campaign.kpis.map(kpi => 
        kpi.name === isEditingKPIDetails.name ? isEditingKPIDetails : kpi
      )
    }

    onUpdateCampaign(updatedCampaign)
    setIsEditingKPIDetails(null)
    toast.success('KPI updated')
  }

  const handleDeleteKPI = (kpiName: string) => {
    if (confirm(`Are you sure you want to delete the "${kpiName}" KPI?`)) {
      const updatedCampaign = {
        ...campaign,
        kpis: campaign.kpis.filter(kpi => kpi.name !== kpiName)
      }
      onUpdateCampaign(updatedCampaign)
      toast.success('KPI deleted')
    }
  }

  const daysRemaining = Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const totalDays = Math.ceil((campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysElapsed = totalDays - daysRemaining
  const timeProgress = (daysElapsed / totalDays) * 100

  // Calculate real metrics from KPIs
  const leadsKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('lead'))
  const currentLeads = leadsKPI?.current || 0
  const targetLeads = leadsKPI?.target || 0
  const leadProgress = targetLeads > 0 ? (currentLeads / targetLeads) * 100 : 0

  const conversionKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('conversion'))
  const currentConversion = conversionKPI?.current || 0

  const engagementKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('engagement'))
  const currentEngagement = engagementKPI?.current || 0

  const metrics = [
    {
      title: 'Total Budget',
      value: `$${campaign.budget.toLocaleString()}`,
      icon: DollarSign,
      subtitle: `${Math.round(timeProgress)}% of timeline elapsed`,
      positive: true,
    },
    {
      title: 'Active Channels',
      value: campaign.channels.length,
      icon: Target,
      subtitle: `${campaign.channels.length} channel${campaign.channels.length !== 1 ? 's' : ''} active`,
      positive: true,
    },
    {
      title: 'Days Remaining',
      value: daysRemaining > 0 ? daysRemaining : 0,
      icon: Calendar,
      subtitle: daysRemaining > 0 ? `${daysElapsed} days elapsed` : 'Campaign ended',
      positive: daysRemaining > 0,
    },
    {
      title: 'Lead Progress',
      value: `${Math.round(leadProgress)}%`,
      icon: Users,
      subtitle: `${currentLeads} of ${targetLeads} leads`,
      positive: leadProgress >= 50,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{campaign.name}</CardTitle>
              <CardDescription className="mt-2 capitalize">
                {campaign.objective.replace('-', ' ')}
              </CardDescription>
            </div>
            <Badge
              variant={campaign.status === 'active' ? 'default' : 'secondary'}
              className="px-3 py-1 capitalize"
            >
              {campaign.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs mt-1 ${metric.positive ? 'text-slate-600' : 'text-amber-600'}`}>
                  {metric.subtitle}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Track progress toward your goals</CardDescription>
              </div>
              <Dialog open={isAddingKPI} onOpenChange={setIsAddingKPI}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add KPI
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New KPI</DialogTitle>
                    <DialogDescription>
                      Create a custom key performance indicator
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>KPI Name</Label>
                      <Input
                        placeholder="e.g., MQLs Generated, Website Traffic"
                        value={newKPI.name}
                        onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Value</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 1000"
                        value={newKPI.target || ''}
                        onChange={(e) => setNewKPI({ ...newKPI, target: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        placeholder="e.g., leads, %, visits, $"
                        value={newKPI.unit}
                        onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddKPI} className="w-full">
                    Add KPI
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {campaign.kpis.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No KPIs yet</p>
                <Button onClick={() => setIsAddingKPI(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First KPI
                </Button>
              </div>
            ) : (
              campaign.kpis.map((kpi) => {
                const percentage = kpi.target > 0 ? (kpi.current / kpi.target) * 100 : 0
                return (
                  <div key={kpi.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{kpi.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600">
                          {kpi.current} / {kpi.target} {kpi.unit}
                        </span>
                        <Dialog open={editingKPI === kpi.name} onOpenChange={(open) => !open && setEditingKPI(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingKPI(kpi.name)
                                setKpiValue(kpi.current)
                              }}
                              title="Update current value"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update {kpi.name}</DialogTitle>
                              <DialogDescription>
                                Enter the current value for this KPI
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Current Value ({kpi.unit})</Label>
                                <Input
                                  type="number"
                                  value={kpiValue}
                                  onChange={(e) => setKpiValue(Number(e.target.value))}
                                  placeholder={`Enter ${kpi.unit}`}
                                />
                              </div>
                              <div className="text-sm text-slate-600">
                                Target: {kpi.target} {kpi.unit}
                              </div>
                            </div>
                            <Button onClick={() => handleUpdateKPIValue(kpi.name)} className="w-full">
                              Update Value
                            </Button>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={isEditingKPIDetails?.name === kpi.name} onOpenChange={(open) => !open && setIsEditingKPIDetails(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => setIsEditingKPIDetails({ ...kpi })}
                              title="Edit KPI details"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit KPI Details</DialogTitle>
                              <DialogDescription>
                                Update name, target, or unit
                              </DialogDescription>
                            </DialogHeader>
                            {isEditingKPIDetails && (
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>KPI Name</Label>
                                  <Input
                                    value={isEditingKPIDetails.name}
                                    onChange={(e) => setIsEditingKPIDetails({ ...isEditingKPIDetails, name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Target Value</Label>
                                  <Input
                                    type="number"
                                    value={isEditingKPIDetails.target}
                                    onChange={(e) => setIsEditingKPIDetails({ ...isEditingKPIDetails, target: Number(e.target.value) })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Unit</Label>
                                  <Input
                                    value={isEditingKPIDetails.unit}
                                    onChange={(e) => setIsEditingKPIDetails({ ...isEditingKPIDetails, unit: e.target.value })}
                                  />
                                </div>
                                <div className="text-sm text-slate-600">
                                  Current: {isEditingKPIDetails.current} {isEditingKPIDetails.unit}
                                </div>
                              </div>
                            )}
                            <Button onClick={handleUpdateKPIDetails} className="w-full">
                              Save Changes
                            </Button>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteKPI(kpi.name)}
                          title="Delete KPI"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    {percentage >= 100 && (
                      <p className="text-xs text-green-600 font-medium">✓ Target achieved!</p>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Timeline</CardTitle>
            <CardDescription>
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Campaign Progress</span>
                <span className="text-slate-600">{Math.round(timeProgress)}%</span>
              </div>
              <Progress value={timeProgress} className="h-2" />
              <p className="text-xs text-slate-600">
                {daysElapsed} of {totalDays} days completed
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Selected Channels</h4>
              <div className="flex flex-wrap gap-2">
                {campaign.channels.map(channel => (
                  <Badge key={channel} variant="secondary">{channel}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Budget Allocation</h4>
              <div className="text-2xl font-bold">${campaign.budget.toLocaleString()}</div>
              <p className="text-xs text-slate-600">
                ~${Math.round(campaign.budget / campaign.channels.length).toLocaleString()} per channel
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target Audience</CardTitle>
          <CardDescription>Campaign focus</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{campaign.targetAudience}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignDashboard
