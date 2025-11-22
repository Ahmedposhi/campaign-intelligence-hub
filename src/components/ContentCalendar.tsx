import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Campaign, ContentItem } from '@/types'
import { FileText, Video, Mail, Layout, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface ContentCalendarProps {
  campaign: Campaign | null
  onUpdateCampaign: (campaign: Campaign) => void
}

const ContentCalendar = ({ campaign, onUpdateCampaign }: ContentCalendarProps) => {
  const [isAddingContent, setIsAddingContent] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [newContent, setNewContent] = useState({
    title: '',
    type: '',
    channel: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'draft' as const
  })

  const contentTypeIcons = {
    'Blog Post': FileText,
    'Email': Mail,
    'Video': Video,
    'Landing Page': Layout,
    'Webinar': Video,
    'Social Post': FileText
  }

  const contentTypeColors = {
    'Blog Post': 'bg-blue-500',
    'Email': 'bg-green-500',
    'Video': 'bg-purple-500',
    'Landing Page': 'bg-orange-500',
    'Webinar': 'bg-red-500',
    'Social Post': 'bg-cyan-500'
  }

  if (!campaign) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle>No campaign selected</CardTitle>
          <CardDescription>
            Create a campaign to start planning your content calendar
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleAddContent = () => {
    if (!newContent.title || !newContent.type || !newContent.channel) {
      toast.error('Please fill in all fields')
      return
    }

    const contentItem: ContentItem = {
      id: Date.now().toString(),
      title: newContent.title,
      type: newContent.type,
      channel: newContent.channel,
      scheduledDate: new Date(newContent.scheduledDate),
      status: newContent.status
    }

    const updatedCampaign = {
      ...campaign,
      content: [...campaign.content, contentItem]
    }

    onUpdateCampaign(updatedCampaign)
    setIsAddingContent(false)
    setNewContent({
      title: '',
      type: '',
      channel: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'draft'
    })
    toast.success('Content added to calendar')
  }

  const handleDeleteContent = (contentId: string) => {
    const updatedCampaign = {
      ...campaign,
      content: campaign.content.filter(c => c.id !== contentId)
    }
    onUpdateCampaign(updatedCampaign)
    toast.success('Content removed')
  }

  const handleUpdateContentStatus = (contentId: string, newStatus: 'draft' | 'scheduled' | 'published') => {
    const updatedCampaign = {
      ...campaign,
      content: campaign.content.map(c =>
        c.id === contentId ? { ...c, status: newStatus } : c
      )
    }
    onUpdateCampaign(updatedCampaign)
    toast.success('Status updated')
  }

  // Count content by type
  const contentCounts = {
    'Blog Post': campaign.content.filter(c => c.type === 'Blog Post').length,
    'Email': campaign.content.filter(c => c.type === 'Email').length,
    'Video': campaign.content.filter(c => c.type === 'Video').length,
    'Landing Page': campaign.content.filter(c => c.type === 'Landing Page').length,
  }

  // Get upcoming content (next 30 days)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const upcomingContent = campaign.content
    .filter(c => {
      const contentDate = new Date(c.scheduledDate)
      return contentDate >= now && contentDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())

  // Generate calendar days for full month
  const generateMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay()
    
    // Generate array of dates
    const days = []
    
    // Add padding days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = new Date(year, month, -startDayOfWeek + i + 1)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Add padding days from next month to complete the grid
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i)
        days.push({ date, isCurrentMonth: false })
      }
    }
    
    return days
  }

  const monthDays = generateMonthDays()

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>Plan and schedule your marketing content for {campaign.name}</CardDescription>
            </div>
            <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                  <DialogDescription>Schedule a new content piece for your campaign</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Content Title</Label>
                    <Input
                      placeholder="e.g., Q4 Product Launch Blog Post"
                      value={newContent.title}
                      onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content Type</Label>
                    <Select value={newContent.type} onValueChange={(value) => setNewContent({ ...newContent, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Blog Post">Blog Post</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Landing Page">Landing Page</SelectItem>
                        <SelectItem value="Webinar">Webinar</SelectItem>
                        <SelectItem value="Social Post">Social Post</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <Select value={newContent.channel} onValueChange={(value) => setNewContent({ ...newContent, channel: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaign.channels.map(channel => (
                          <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={newContent.scheduledDate}
                      onChange={(e) => setNewContent({ ...newContent, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={newContent.status} onValueChange={(value: any) => setNewContent({ ...newContent, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddContent} className="w-full">
                  Add Content
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(contentCounts).map(([type, count]) => {
          const Icon = contentTypeIcons[type as keyof typeof contentTypeIcons]
          const color = contentTypeColors[type as keyof typeof contentTypeColors]
          return (
            <Card key={type}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`${color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-slate-600">{type}{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {upcomingContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Content</CardTitle>
            <CardDescription>Next 30 days ({upcomingContent.length} item{upcomingContent.length !== 1 ? 's' : ''})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.channel}</span>
                      <span>•</span>
                      <span>{new Date(item.scheduledDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={item.status} onValueChange={(value: any) => handleUpdateContentStatus(item.id, value)}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteContent(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Month Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day, idx) => {
              const dayContent = campaign.content.filter(c => {
                const contentDate = new Date(c.scheduledDate)
                return contentDate.toDateString() === day.date.toDateString()
              })

              const isToday = day.date.toDateString() === new Date().toDateString()

              return (
                <div 
                  key={idx} 
                  className={`min-h-[100px] border rounded-lg p-2 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                  } ${isToday ? 'border-blue-500 border-2' : 'border-slate-200'}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    day.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                  } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayContent.map(content => {
                      const color = contentTypeColors[content.type as keyof typeof contentTypeColors] || 'bg-slate-500'
                      return (
                        <div 
                          key={content.id} 
                          className={`p-1 ${color.replace('bg-', 'bg-').replace('-500', '-100')} rounded text-xs font-medium ${color.replace('bg-', 'text-').replace('-500', '-700')} truncate`}
                          title={content.title}
                        >
                          {content.title.length > 15 ? content.title.substring(0, 15) + '...' : content.title}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContentCalendar
