import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import type { Campaign, KPI } from '@/types'
import { ChevronRight, ChevronLeft, Sparkles, Target, Users, DollarSign, Calendar as CalendarIcon, Wand2, ArrowUpRightFromSquare, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { generateDefaultKPIs } from '@/utils/kpiDefaults'

interface CampaignWizardProps {
  onCampaignCreate: (campaign: Campaign) => void
}

const CAMPAIGN_STORAGE_KEY = 'campaignHub_formData';

const initialFormData = {
  name: '',
  objective: '',
  targetAudience: '',
  budget: '',
  duration: '', 
  channels: [] as string[],
};

// Custom hook to load/save form data to localStorage
const usePersistentForm = () => {
    const [formData, setFormData] = useState(() => {
        try {
            const savedData = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
            return savedData ? JSON.parse(savedData) : initialFormData;
        } catch (error) {
            console.error("Error loading state from localStorage:", error);
            return initialFormData;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(formData));
        } catch (error) {
            console.error("Error saving state to localStorage:", error);
        }
    }, [formData]);

    return [formData, setFormData] as const;
};

const CampaignWizard = ({ onCampaignCreate }: CampaignWizardProps) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = usePersistentForm();

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false); 
  const [isSuggestingChannels, setIsSuggestingChannels] = useState(false);
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);


  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  // Channels array with hints (updated for single-line text)
  const channels = [
    { name: 'LinkedIn', hint: 'B2B primary social and account engagement channel.' },
    { name: 'Email', hint: 'Nurture, retention, and personalized communication.' },
    { name: 'Content Marketing', hint: 'Long-term SEO, thought leadership, and inbound.' },
    { name: 'Webinars', hint: 'High-intent lead generation and product education.' },
    { name: 'Paid Search', hint: 'Capturing immediate, high-intent demand (BOFU).' },
    { name: 'Display Ads', hint: 'Retargeting and broad awareness across the web.' },
    { name: 'SEO', hint: 'Organic authority and long-term content ranking.' },
    { name: 'Social Media', hint: 'General brand building and community engagement (TOFU).' },
    { name: 'Events', hint: 'Trade shows, conferences, and field marketing.' },
    { name: 'ABM Platforms', hint: 'Directly targeting high-value, predefined account lists.' },
    { name: 'Partner/Affiliate Marketing', hint: 'Leveraging ecosystem to drive co-selling or referrals.' },
    { name: 'Third-Party Review Sites', hint: 'Social proof and validation for B2B software.'},
    { name: 'Technical Documentation', hint: 'PLG support, feature adoption, and technical buyers.'},
    { name: 'Retargeting/Programmatic', hint: 'Keeping warm leads engaged to accelerate pipeline.'}
  ]
  const channelNames = channels.map(c => c.name);


  // Feature B: Strategic AI Ideas Implementation
  const handleGenerateIdeas = async () => {
    if (!formData.objective || !formData.targetAudience || !formData.budget || formData.channels.length === 0) {
      toast.error('Please complete all fields (Objective, Audience, Budget, Channels) before generating ideas.')
      return
    }

    setIsGenerating(true)
    setAiSuggestions([])

    const prompt = `
      Objective: ${formData.objective.replace('-', ' ')}
      Audience: ${formData.targetAudience}
      Budget: ${formData.budget}
      Channels: ${formData.channels.join(', ')}
    `;

    try {
      const ideas = await callGeminiAPI(prompt);
      if (ideas.length > 0) {
        setAiSuggestions(ideas);
        toast.success('AI strategic ideas generated successfully!');
      } else {
        setAiSuggestions(['No specific ideas were generated. Try refining your audience description or inputs.']);
        toast.error('AI returned no specific ideas.');
      }
    } catch (error) {
      toast.error('Error contacting the AI service. Please try again.');
      console.error('AI Generation Error:', error);
      setAiSuggestions([]);
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Feature F: AI Idea Enhancement Implementation
  const handleEnhanceIdeas = async () => {
    if (!enhancementPrompt.trim()) {
      toast.error('Please enter your enhancement request (e.g., "focus on a smaller budget").');
      return;
    }
    
    setIsEnhancing(true);
    
    try {
        const enhancedIdeas = await callGeminiAPIEnhance(enhancementPrompt, aiSuggestions);
        if (enhancedIdeas.length > 0) {
            setAiSuggestions(enhancedIdeas);
            toast.success('AI successfully enhanced the GTM ideas!');
            setEnhancementPrompt(''); // Clear prompt after success
            setIsIdeaModalOpen(false); // Close the modal
        } else {
            toast.error('AI could not enhance the ideas.');
        }
    } catch (error) {
        toast.error('Error enhancing ideas. Please check your network or try a simpler request.');
        console.error('AI Enhancement Error:', error);
    } finally {
        setIsEnhancing(false);
    }
  }


  // Feature C: AI Audience Refinement Implementation
  const handleRefineAudience = async () => {
    if (!formData.targetAudience.trim() || formData.targetAudience.trim().length < 20) {
        toast.error('Please enter a draft description of your audience first (at least 20 characters).');
        return;
    }

    setIsRefining(true);

    try {
        const refinedText = await callGeminiAPIRefine(formData.targetAudience);
        setFormData(prev => ({ ...prev, targetAudience: refinedText }));
        toast.success('Audience description refined by AI for GTM clarity.');
    } catch (error) {
        toast.error('Failed to refine audience text.');
        console.error('AI Refinement Error:', error);
    } finally {
        setIsRefining(false);
    }
  }
  
  // Feature E: AI Channel Selector Implementation
  const handleSuggestChannels = async () => {
    if (!formData.objective || !formData.targetAudience || !formData.duration || !formData.budget) {
      toast.error('Complete Objective, Audience, Duration, and Budget before suggesting channels.')
      return
    }
    
    setIsSuggestingChannels(true);

    const prompt = `
      Objective: ${formData.objective.replace('-', ' ')}
      Audience: ${formData.targetAudience}
      Duration: ${formData.duration} days
      Budget: ${formData.budget}
    `;

    try {
        const suggestedChannelNames = await callGeminiAPIChannelSuggest(prompt);
        
        // Filter suggested names against the master list to ensure validity
        const validSuggestions = suggestedChannelNames.filter(name => channelNames.includes(name));
        
        if (validSuggestions.length > 0) {
            // Select the suggested channels, keeping existing ones unless suggested
            setFormData(prev => ({
                ...prev,
                channels: Array.from(new Set([...prev.channels, ...validSuggestions])),
            }));
            toast.success(`AI suggested ${validSuggestions.length} channels.`);
        } else {
            toast.warning('AI could not suggest specific channels based on inputs.');
        }

    } catch (error) {
        toast.error('Error suggesting channels.');
        console.error('AI Channel Suggestion Error:', error);
    } finally {
        setIsSuggestingChannels(false);
    }
  }

  const handleChannelToggle = (channelName: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelName)
        ? prev.channels.filter(c => c !== channelName)
        : [...prev.channels, channelName]
    }))
  }

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.objective || !formData.duration)) {
      toast.error('Please fill in the Campaign Name, Objective, AND Duration.')
      return
    }
    if (step === 2 && !formData.targetAudience) {
      toast.error('Please describe your Target Audience.')
      return
    }
    if (step === 3 && (!formData.budget || formData.channels.length === 0)) {
      toast.error('Please specify the budget and select at least one channel.')
      return
    }

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
      kpis: [], 
      content: [],
      status: 'planning'
    }
    onCampaignCreate(campaign)
    // Clear storage/state only after successful creation
    localStorage.removeItem(CAMPAIGN_STORAGE_KEY);
    setFormData(initialFormData);
    setAiSuggestions([]);
    setStep(1);
    toast.success(`Campaign "${campaign.name}" created!`);
  }

  // Find the selected channel names for display in Step 4
  const selectedChannelsWithHints = channels.filter(c => formData.channels.includes(c.name));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Create New Campaign</CardTitle>
            <CardDescription>Step {step} of {totalSteps}</CardDescription>
          </div>
          <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
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
                    <span key={channel} className="px-2 py-1 bg-slate-100 text-sm rounded">
                      {channel}
                    </span>
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
