import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Campaign } from '@/types'
import { useCampaignContext } from '@/context/CampaignContext'
import { DollarSign, TrendingUp, Users, Target, BarChart3, Zap, AlertCircle, CheckCircle } from 'lucide-react'

interface ROICalculatorProps {
  campaign?: Campaign | null
  campaigns?: Campaign[]
  onSelectCampaign?: (campaign: Campaign) => void
}

const ROICalculator = ({ campaign: propCampaign }: ROICalculatorProps) => {
  const { selectedCampaign } = useCampaignContext()
  const campaign = selectedCampaign || propCampaign || null
  // Default to 0 so ROI calculations start from zero until user or campaign provides values
  const [investment, setInvestment] = useState(0)
  const [leads, setLeads] = useState(0)
  const [conversionRate, setConversionRate] = useState(0)
  const [avgDealValue, setAvgDealValue] = useState(0)
  const [scenarios, setScenarios] = useState<Array<{ name: string; investment: number; leads: number; conversionRate: number; avgDealValue: number }>>([])
  const [editingScenarioIdx, setEditingScenarioIdx] = useState<number | null>(null)
  const [editingScenarioName, setEditingScenarioName] = useState('')
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number | null>(null)
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null)
  const isLoadingRef = useRef(true)
  const isInputLoadingRef = useRef(true)
  const prevCampaignIdRef = useRef<string | null>(null)

  // Load scenarios from localStorage on mount or when campaign changes
  useEffect(() => {
    if (campaign?.id) {
      const savedScenarios = localStorage.getItem(`roi-scenarios-${campaign.id}`)
      if (savedScenarios) {
        try {
          setScenarios(JSON.parse(savedScenarios))
        } catch (e) {
          console.error('Failed to load scenarios:', e)
          setScenarios([])
        }
      } else {
        setScenarios([])
      }
      // Set isLoadingRef to false after scenarios are loaded
      setTimeout(() => { isLoadingRef.current = false }, 0)
    }
  }, [campaign?.id])

  // Save scenarios to localStorage whenever they change (skip first load)
  useEffect(() => {
    if (campaign?.id && !isLoadingRef.current) {
      localStorage.setItem(`roi-scenarios-${campaign.id}`, JSON.stringify(scenarios))
    }
  }, [scenarios, campaign?.id])
  useEffect(() => {
    // Persist previous campaign inputs, then load inputs for the newly selected campaign.
    const prevId = prevCampaignIdRef.current
    if (prevId && prevId !== campaign?.id) {
      try {
        localStorage.setItem(`roi-inputs-${prevId}`, JSON.stringify({ investment, leads, conversionRate, avgDealValue }))
      } catch (e) {
        console.error('Failed to save inputs for previous campaign', e)
      }
    }
    prevCampaignIdRef.current = campaign?.id ?? null

    if (campaign?.id) {
      // Try to restore saved inputs for this campaign first
      const saved = localStorage.getItem(`roi-inputs-${campaign.id}`)
      if (saved) {
        try {
          isInputLoadingRef.current = true
          const obj = JSON.parse(saved)
          setInvestment(typeof obj.investment === 'number' ? obj.investment : 0)
          setLeads(typeof obj.leads === 'number' ? obj.leads : 0)
          setConversionRate(typeof obj.conversionRate === 'number' ? obj.conversionRate : 0)
          setAvgDealValue(typeof obj.avgDealValue === 'number' ? obj.avgDealValue : 0)
        } catch (e) {
          console.error('Failed to parse saved inputs', e)
          // fallback to campaign KPIs
          loadCampaignKPIs()
        } finally {
          setTimeout(() => { isInputLoadingRef.current = false }, 0)
        }
      } else {
        // No saved inputs; load campaign KPIs
        loadCampaignKPIs()
        setTimeout(() => { isInputLoadingRef.current = false }, 0)
      }
    }
  }, [campaign?.id])

  // Persist ROI input changes for the selected campaign (skip during input load)
  useEffect(() => {
    if (!campaign?.id) return
    if (isInputLoadingRef.current) return
    try {
      localStorage.setItem(`roi-inputs-${campaign.id}`, JSON.stringify({ investment, leads, conversionRate, avgDealValue }))
    } catch (e) {
      console.error('Failed to persist roi inputs', e)
    }
  }, [investment, leads, conversionRate, avgDealValue, campaign?.id])

  const loadCampaignKPIs = () => {
    if (!campaign) {
      toast.error('No campaign selected')
      return
    }

    setInvestment(typeof campaign.budget === 'number' ? campaign.budget : 0)

    const leadsKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('lead'))
    setLeads(leadsKPI ? leadsKPI.target : 0)

    const conversionKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('conversion'))
    setConversionRate(conversionKPI ? conversionKPI.target : 0)

    const dealKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('deal') || kpi.name.toLowerCase().includes('avg'))
    setAvgDealValue(dealKPI ? dealKPI.target : 0)

    toast.success('Campaign KPIs loaded into the calculator')
  }

  const saveScenario = () => {
    const scenarioName = `Scenario ${scenarios.length + 1}`
    setScenarios([...scenarios, { name: scenarioName, investment, leads, conversionRate, avgDealValue }])
    toast.success('Scenario saved!')
  }

  const loadScenario = (index: number) => {
    const scenario = scenarios[index]
    if (scenario) {
      setInvestment(scenario.investment)
      setLeads(scenario.leads)
      setConversionRate(scenario.conversionRate)
      setAvgDealValue(scenario.avgDealValue)
      setActiveScenarioIdx(index)
      toast.success(`Scenario "${scenario.name}" loaded!`)
    }
  }

  const deleteScenario = (index: number) => {
    const deleted = scenarios[index]?.name
    setScenarios(scenarios.filter((_, i) => i !== index))
    setDeleteConfirmIdx(null)
    if (activeScenarioIdx === index) setActiveScenarioIdx(null)
    toast.success(`Scenario "${deleted}" deleted!`)
  }

  const startRenameScenario = (idx: number, name: string) => {
    setEditingScenarioIdx(idx)
    setEditingScenarioName(name)
  }

  const saveRenameScenario = (idx: number) => {
    if (editingScenarioName.trim() === '') {
      toast.error('Scenario name cannot be empty')
      return
    }
    setScenarios(scenarios.map((s, i) => i === idx ? { ...s, name: editingScenarioName } : s))
    setEditingScenarioIdx(null)
    toast.success('Scenario renamed!')
  }

  const conversions = Math.round(leads * (conversionRate / 100))
  const revenue = conversions * avgDealValue
  const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0
  const cpl = leads > 0 ? investment / leads : 0
  const cac = conversions > 0 ? investment / conversions : 0
  const profitMargin = revenue > 0 ? ((revenue - investment) / revenue * 100) : 0
  const revenueMultiple = investment > 0 ? (revenue / investment) : 0

  const getRoiStatus = () => {
    if (roi > 200) return { color: 'text-emerald-600', bgColor: 'bg-emerald-50', status: 'Outstanding', icon: CheckCircle }
    if (roi > 100) return { color: 'text-green-600', bgColor: 'bg-green-50', status: 'Excellent', icon: CheckCircle }
    if (roi > 50) return { color: 'text-blue-600', bgColor: 'bg-blue-50', status: 'Strong', icon: TrendingUp }
    if (roi > 0) return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', status: 'Positive', icon: AlertCircle }
    return { color: 'text-red-600', bgColor: 'bg-red-50', status: 'Negative', icon: AlertCircle }
  }

  const status = getRoiStatus()

  // Resolve the currently selected campaign object for display
  const displayCampaign = campaign || null

  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      highlight: true
    },
    {
      label: 'Net Profit',
      value: `$${(revenue - investment).toLocaleString()}`,
      icon: TrendingUp,
      color: revenue - investment > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: revenue - investment > 0 ? 'bg-green-50' : 'bg-red-50',
      highlight: true
    },
    {
      label: 'Cost Per Lead',
      value: `$${cpl.toFixed(2)}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'CAC',
      value: `$${cac.toFixed(2)}`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="bg-black text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-start justify-between gap-8">
          {/* Left Section: Title and Campaign */}
          <div className="flex items-start gap-4 flex-1">
            <BarChart3 className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-4xl font-bold">ROI Calculator</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time marketing ROI projections</p>
              {displayCampaign && (
                <>
                  <p className="mt-3 text-lg font-semibold text-white">{displayCampaign.name}</p>
                  {investment === 0 && leads === 0 && conversionRate === 0 && avgDealValue === 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <p className="text-sm text-gray-300">No ROI inputs yet — enter values or load campaign KPIs.</p>
                      <Button size="sm" variant="outline" onClick={loadCampaignKPIs}>
                        Load campaign KPIs
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Section: Projected ROI */}
          <div className="flex flex-col items-end justify-start">
            <p className="text-sm font-medium text-gray-400 mb-2">Projected ROI</p>
            <p className={`text-5xl font-bold ${status.color} leading-none mb-3`}>{roi.toFixed(1)}%</p>
            <Badge className={`${status.bgColor} ${status.color} border-0 text-sm px-4 py-1 pointer-events-none`}>
              {status.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid - Full Width */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className={metric.highlight ? 'ring-2 ring-slate-200' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${metric.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                </div>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Controls */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Campaign Inputs
            </CardTitle>
            <CardDescription>Adjust these values to model different scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="investment">Total Investment</Label>
                <span className="font-bold text-lg">${investment.toLocaleString()}</span>
              </div>
              <Slider
                id="investment"
                min={0}
                max={200000}
                step={5000}
                value={[investment]}
                onValueChange={(value) => setInvestment(value[0])}
              />
              <p className="text-xs text-slate-600">Range: $0 - $200,000</p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="leads">Expected Leads</Label>
                <span className="font-bold text-lg">{leads.toLocaleString()}</span>
              </div>
              <Slider
                id="leads"
                min={0}
                max={2000}
                step={50}
                value={[leads]}
                onValueChange={(value) => setLeads(value[0])}
              />
              <p className="text-xs text-slate-600">Range: 0 - 2,000 leads</p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="conversion">Conversion Rate</Label>
                <span className="font-bold text-lg">{conversionRate.toFixed(1)}%</span>
              </div>
              <Slider
                id="conversion"
                min={0}
                max={20}
                step={0.5}
                value={[conversionRate]}
                onValueChange={(value) => setConversionRate(value[0])}
              />
              <p className="text-xs text-slate-600">Range: 0% - 20%</p>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
              <Label htmlFor="dealValue">Average Deal Value</Label>
              <Input
                id="dealValue"
                type="number"
                placeholder="Enter deal value"
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(Number(e.target.value))}
                className="text-lg font-medium border-2 border-slate-300"
              />
            </div>

            <Button 
              onClick={saveScenario}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={investment === 0 && leads === 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Save This Scenario
            </Button>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Detailed breakdown of your campaign performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                <p className="text-xs font-medium text-emerald-700 mb-1">Conversions</p>
                <p className="text-2xl font-bold text-emerald-900">{conversions}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-xs font-medium text-purple-700 mb-1">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-900">{profitMargin.toFixed(1)}%</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-700 mb-1">Revenue Multiple</p>
                <p className="text-2xl font-bold text-blue-900">{revenueMultiple.toFixed(2)}x</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <p className="text-xs font-medium text-orange-700 mb-1">Lead Value</p>
                <p className="text-2xl font-bold text-orange-900">${(revenue / Math.max(leads, 1)).toFixed(0)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Cost Per Lead (CPL)</span>
                  <span className="font-bold text-slate-900">${cpl.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Customer Acquisition Cost (CAC)</span>
                  <span className="font-bold text-slate-900">${cac.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Cost per $1 of Revenue</span>
                  <span className="font-bold text-slate-900">${investment > 0 ? (investment / Math.max(revenue, 1)).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>

            {investment > 0 && (
              <div className={`${status.bgColor} border-l-4 p-4 rounded`}>
                <p className="text-sm font-medium text-slate-900">{status.status} ROI Expected</p>
                <p className="text-xs text-slate-600 mt-1">
                  {roi > 100 
                    ? 'Excellent returns! This campaign is projected to be highly profitable.'
                    : roi > 50 
                    ? 'Good performance. Consider optimizing further for even better returns.'
                    : roi > 0 
                    ? 'Positive ROI. Focus on improving conversion rates or reducing costs.'
                    : 'Review your assumptions and look for cost reduction opportunities.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved Scenarios */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              Saved Scenarios ({scenarios.length})
            </CardTitle>
            <CardDescription>Compare different campaign configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium">Scenario</th>
                    <th className="text-right py-3 px-4 font-medium">Investment</th>
                    <th className="text-right py-3 px-4 font-medium">Leads</th>
                    <th className="text-right py-3 px-4 font-medium">Conv. Rate</th>
                    <th className="text-right py-3 px-4 font-medium">Deal Value</th>
                    <th className="text-right py-3 px-4 font-medium">ROI</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario, idx) => {
                    const scenarioRoi = scenario.investment > 0 
                      ? (((scenario.leads * (scenario.conversionRate / 100) * scenario.avgDealValue - scenario.investment) / scenario.investment) * 100)
                      : 0
                    const isActive = activeScenarioIdx === idx
                    return (
                      <tr key={idx} className={`border-b hover:bg-slate-50 ${isActive ? 'bg-blue-50' : ''}`}>
                        <td className="py-3 px-4 font-medium">
                          {editingScenarioIdx === idx ? (
                            <div className="flex items-center gap-2">
                              <input
                                className="border rounded px-2 py-1 text-sm w-32"
                                value={editingScenarioName}
                                autoFocus
                                onChange={e => setEditingScenarioName(e.target.value)}
                                onBlur={() => saveRenameScenario(idx)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveRenameScenario(idx)
                                  if (e.key === 'Escape') setEditingScenarioIdx(null)
                                }}
                              />
                              <Button size="icon" variant="ghost" onClick={() => saveRenameScenario(idx)}><Check className="w-4 h-4 text-green-600" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingScenarioIdx(null)}><X className="w-4 h-4 text-red-600" /></Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{scenario.name}</span>
                              <Button size="icon" variant="ghost" onClick={() => startRenameScenario(idx, scenario.name)} title="Rename scenario">
                                <Pencil className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="text-right py-3 px-4">${scenario.investment.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{scenario.leads}</td>
                        <td className="text-right py-3 px-4">{scenario.conversionRate}%</td>
                        <td className="text-right py-3 px-4">${scenario.avgDealValue.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <Badge className={scenarioRoi > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {scenarioRoi.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4 space-x-1">
                          <Button 
                            size="sm" 
                            variant={isActive ? 'default' : 'outline'}
                            onClick={() => loadScenario(idx)}
                            disabled={isActive}
                            title={isActive ? 'Active scenario' : 'Load scenario'}
                          >
                            Load
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setDeleteConfirmIdx(idx)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete scenario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {/* Delete confirmation dialog */}
                          {deleteConfirmIdx === idx && (
                            <div className="absolute z-50 bg-white border rounded shadow-lg p-4 flex flex-col gap-2" style={{ left: '50%', transform: 'translateX(-50%)', minWidth: 200 }}>
                              <span className="text-sm mb-2">Delete <b>{scenario.name}</b>?</span>
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => setDeleteConfirmIdx(null)}>Cancel</Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteScenario(idx)}>Delete</Button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ROICalculator
