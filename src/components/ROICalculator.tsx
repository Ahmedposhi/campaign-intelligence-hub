import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import type { Campaign } from '@/types'
import { DollarSign, Users, Target, RefreshCw, TrendingUp } from 'lucide-react'

interface ROICalculatorProps {
  campaign: Campaign | null
}

const ROICalculator = ({ campaign }: ROICalculatorProps) => {
  const [investment, setInvestment] = useState(50000)
  const [leads, setLeads] = useState(500)
  const [conversionRate, setConversionRate] = useState(5)
  const [avgDealValue, setAvgDealValue] = useState(25000)

  // Load campaign data when campaign changes
  useEffect(() => {
    if (campaign) {
      setInvestment(campaign.budget)
      // Find leads KPI if it exists
      const leadsKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('lead'))
      if (leadsKPI) {
        setLeads(leadsKPI.target)
      }
      // Find conversion rate KPI if it exists
      const conversionKPI = campaign.kpis.find(kpi => kpi.name.toLowerCase().includes('conversion'))
      if (conversionKPI) {
        setConversionRate(conversionKPI.target)
      }
    }
  }, [campaign])

  const resetToDefaults = () => {
    setInvestment(50000)
    setLeads(500)
    setConversionRate(5)
    setAvgDealValue(25000)
  }

  const conversions = Math.round(leads * (conversionRate / 100))
  const revenue = conversions * avgDealValue
  const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0
  const cpl = leads > 0 ? investment / leads : 0
  const cac = conversions > 0 ? investment / conversions : 0
  const profitMargin = revenue > 0 ? ((revenue - investment) / revenue * 100) : 0
  const revenueMultiple = investment > 0 ? (revenue / investment) : 0

  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'ROI',
      value: `${roi.toFixed(1)}%`,
      icon: TrendingUp,
      color: roi > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: roi > 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Cost Per Lead',
      value: `$${cpl.toFixed(2)}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Customer Acquisition Cost',
      value: `$${cac.toFixed(2)}`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">ROI Calculator</CardTitle>
              <CardDescription>
                {campaign ? (
                  <>Calculate ROI for: <span className="font-semibold">{campaign.name}</span></>
                ) : (
                  'Calculate your marketing campaign return on investment'
                )}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefaults}
              title="Reset to default values"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
      </Card>

      {!campaign && (
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium text-sm mb-1 text-blue-900">No Campaign Selected</h4>
                <p className="text-sm text-blue-700">
                  Create a campaign first, and the calculator will auto-populate with your campaign's budget and targets. 
                  Or use the calculator independently with custom values.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Inputs</CardTitle>
            <CardDescription>Adjust values to see ROI projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="investment">Total Investment</Label>
                <span className="text-sm font-medium">${investment.toLocaleString()}</span>
              </div>
              <Slider
                id="investment"
                min={10000}
                max={200000}
                step={5000}
                value={[investment]}
                onValueChange={(value) => setInvestment(value[0])}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="leads">Expected Leads</Label>
                <span className="text-sm font-medium">{leads}</span>
              </div>
              <Slider
                id="leads"
                min={100}
                max={2000}
                step={50}
                value={[leads]}
                onValueChange={(value) => setLeads(value[0])}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="conversion">Conversion Rate</Label>
                <span className="text-sm font-medium">{conversionRate}%</span>
              </div>
              <Slider
                id="conversion"
                min={1}
                max={20}
                step={0.5}
                value={[conversionRate]}
                onValueChange={(value) => setConversionRate(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealValue">Average Deal Value</Label>
              <Input
                id="dealValue"
                type="number"
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(Number(e.target.value))}
                className="text-lg font-medium"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Expected Conversions</span>
                  {conversions}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                      <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                    </div>
                    <div className={`${metric.bgColor} p-4 rounded-lg`}>
                      <Icon className={`w-8 h-8 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ROI Breakdown</CardTitle>
          <CardDescription>Detailed cost and revenue analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600">Total Investment</p>
                <p className="text-xl font-bold">${investment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expected Revenue</p>
                <p className="text-xl font-bold text-green-600">${revenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Net Profit</p>
                <p className={`text-2xl font-bold ${revenue - investment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(revenue - investment).toLocaleString()}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                <p className="text-2xl font-bold">{profitMargin.toFixed(1)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Revenue Multiple</p>
                <p className="text-2xl font-bold">{revenueMultiple.toFixed(2)}x</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                ROI Analysis
              </h4>
              <p className="text-sm text-slate-700">
                {roi > 100 ? (
                  <>
                    Excellent ROI! Your campaign is projected to generate over ${((roi / 100) * investment).toLocaleString()} 
                    in profit, delivering a {roi.toFixed(1)}% return on investment.
                  </>
                ) : roi > 50 ? (
                  <>
                    Strong ROI performance. With a {roi.toFixed(1)}% return, this campaign shows good potential 
                    for generating ${(revenue - investment).toLocaleString()} in net profit.
                  </>
                ) : roi > 0 ? (
                  <>
                    Positive ROI of {roi.toFixed(1)}%. Consider optimizing conversion rates or reducing acquisition 
                    costs to improve returns.
                  </>
                ) : (
                  <>
                    Negative ROI detected. Review your conversion rate assumptions and average deal value to ensure 
                    campaign viability.
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ROICalculator
