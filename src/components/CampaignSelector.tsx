import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Campaign } from '@/types'
import { Edit, Trash2, Play, Pause, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface CampaignSelectorProps {
  campaigns: Campaign[]
  activeCampaign: Campaign | null
  onSelectCampaign: (campaign: Campaign) => void
  onUpdateCampaign: (campaign: Campaign) => void
  onDeleteCampaign: (campaignId: string) => void
}

const CampaignSelector = ({
  campaigns,
  activeCampaign,
  onSelectCampaign,
  onUpdateCampaign,
  onDeleteCampaign
}: CampaignSelectorProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Campaign | null>(null)

  const handleEdit = (campaign: Campaign) => {
    setEditForm(campaign)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (!editForm) return
    onUpdateCampaign(editForm)
    setIsEditing(false)
    setEditForm(null)
    toast.success('Campaign updated successfully')
  }

  const handleDelete = (campaign: Campaign) => {
    if (confirm(`Are you sure you want to delete "${campaign.name}"? This cannot be undone.`)) {
      onDeleteCampaign(campaign.id)
      toast.success('Campaign deleted')
    }
  }

  const handleStatusChange = (campaign: Campaign, newStatus: Campaign['status']) => {
    const updated = { ...campaign, status: newStatus }
    onUpdateCampaign(updated)
    toast.success(`Campaign status changed to ${newStatus}`)
  }

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />
      case 'active': return <Play className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'planning': return 'bg-slate-100 text-slate-700'
      case 'active': return 'bg-green-100 text-green-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
    }
  }

  if (campaigns.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-slate-600">No campaigns yet. Create your first campaign to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Campaigns</CardTitle>
              <CardDescription>Select and manage your marketing campaigns</CardDescription>
            </div>
            <Badge variant="outline">{campaigns.length} Total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {campaigns.map(campaign => {
              const isActive = activeCampaign?.id === campaign.id
              return (
                <div
                  key={campaign.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isActive ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onSelectCampaign(campaign)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={`${getStatusColor(campaign.status)} capitalize`}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1">{campaign.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 capitalize mb-3">
                        {campaign.objective.replace('-', ' ')}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>💰 ${campaign.budget.toLocaleString()}</span>
                        <span>📅 {new Date(campaign.startDate).toLocaleDateString()}</span>
                        <span>📊 {campaign.channels.length} channels</span>
                        <span>📝 {campaign.content.length} content items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Select
                        value={campaign.status}
                        onValueChange={(value: Campaign['status']) => handleStatusChange(campaign, value)}
                      >
                        <SelectTrigger className="w-[140px]" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(campaign)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(campaign)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>Update campaign details</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Objective</Label>
                <Select
                  value={editForm.objective}
                  onValueChange={(value) => setEditForm({ ...editForm, objective: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead-generation">Lead Generation</SelectItem>
                    <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                    <SelectItem value="product-launch">Product Launch</SelectItem>
                    <SelectItem value="customer-retention">Customer Retention</SelectItem>
                    <SelectItem value="thought-leadership">Thought Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea
                  value={editForm.targetAudience}
                  onChange={(e) => setEditForm({ ...editForm, targetAudience: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  value={editForm.budget}
                  onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={new Date(editForm.startDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditForm({ ...editForm, startDate: new Date(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={new Date(editForm.endDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditForm({ ...editForm, endDate: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="text-sm text-slate-600 mb-2">
                  Current: {editForm.channels.join(', ')}
                </div>
                <p className="text-xs text-slate-500">
                  To modify channels, create a new campaign or manage in the wizard
                </p>
              </div>
            </div>
          )}
          <Button onClick={handleSaveEdit} className="w-full">
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CampaignSelector
