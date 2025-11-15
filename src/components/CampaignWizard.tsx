import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Campaign } from '@/types'
import { ChevronRight, ChevronLeft, Sparkles, Target, Users, DollarSign, Calendar as CalendarIcon } from 'lucide-react'

interface CampaignWizardProps {
  onCampaignCreate: (campaign: Campaign) => void
}

const CampaignWizard = ({ onCampaignCreate }: CampaignWizardProps) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    targetAudience: '',
    budget: '',
    duration: '30',
    channels: [] as string[],
  })

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const channels = ['LinkedIn', 'Email', 'Content Marketing', 'Webinars', 'Paid Search', 'Display Ads', 'SEO']

  const handleGenerateIdeas = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const suggestions = [
        'Launch a thought leadership series featuring customer success stories',
        'Create an interactive ROI calculator as a lead magnet',
        'Develop a multi-touch nurture campaign with personalized content',
        'Host an executive roundtable webinar series',
        'Build a comprehensive resource hub with gated content'
      ]
      setAiSuggestions(suggestions)
      setIsGenerating(false)
    }, 1500)
  }

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: formData.name,
      objective: formData.objective,
      targetAudience: formData.targetAudience,
      budget: parseFloat(formData.budget),
      startDate: new Date(),
      endDate: new Date(Date.now() + parseInt(formData.duration) * 24 * 60 * 60 * 1000),
      channels: formData.channels,
      kpis: [], // Start with empty KPIs - users will add their own
      content: [],
      status: 'planning'
    }
    onCampaignCreate(campaign)
    setFormData({ name: '', objective: '', targetAudience: '', budget: '', duration: '30', channels: [] })
    setStep(1)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Create New Campaign</CardTitle>
            <CardDescription>Step {step} of {totalSteps}</CardDescription>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Campaign Basics</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="Q4 Product Launch Campaign"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Campaign Objective</Label>
              <Select
                value={formData.objective}
                onValueChange={(value) => setFormData({ ...formData, objective: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary objective" />
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
              <Label htmlFor="duration">Campaign Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Target Audience</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Describe Your Target Audience</Label>
              <Textarea
                id="audience"
                placeholder="IT Decision Makers in mid-market companies (500-2000 employees), focusing on cloud infrastructure modernization..."
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                rows={4}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-2">AI Campaign Ideas</h4>
                  {aiSuggestions.length === 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateIdeas}
                      disabled={isGenerating}
                      className="mt-2"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Ideas'}
                    </Button>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {aiSuggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Budget & Channels</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="50000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <Label>Marketing Channels</Label>
              <div className="grid grid-cols-2 gap-3">
                {channels.map(channel => (
                  <button
                    key={channel}
                    onClick={() => handleChannelToggle(channel)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.channels.includes(channel)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{channel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Review & Launch</h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600">Campaign Name</p>
                <p className="font-semibold">{formData.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Objective</p>
                <p className="font-semibold capitalize">{formData.objective.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Budget</p>
                <p className="font-semibold">${parseFloat(formData.budget || '0').toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Duration</p>
                <p className="font-semibold">{formData.duration} days</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Channels</p>
                <div className="flex flex-wrap gap-2">
                  {formData.channels.map(channel => (
                    <Badge key={channel} variant="secondary">{channel}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                🎉 Your campaign is ready to launch! Click "Create Campaign" to get started.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              Create Campaign
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CampaignWizard
