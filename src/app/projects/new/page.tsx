"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, X, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { ProjectFormData } from '@/types'

const industries = [
  'E-commerce', 'SaaS', 'Health & Wellness', 'Education', 'Finance', 'Real Estate',
  'Marketing Agency', 'Consulting', 'Food & Beverage', 'Fashion', 'Technology',
  'Healthcare', 'Travel', 'Entertainment', 'Automotive', 'Other'
]

const businessGoals = [
  'Generate leads', 'Increase sales', 'Build email list', 'Launch new product',
  'Grow brand awareness', 'Collect customer data', 'Promote services',
  'Drive webinar signups', 'Increase conversions', 'Build community'
]

const toneOptions = ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Conversational', 'Inspiring']
const styleOptions = ['Direct', 'Storytelling', 'Educational', 'Persuasive', 'Emotional', 'Data-driven']

export default function CreateProjectPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    businessName: '',
    businessDescription: '',
    industry: '',
    targetAudience: '',
    businessGoals: [] as string[],
    monthlyRevenue: '',
    competitorUrls: [''],
    geographic: {
      scope: 'auto',
      location: '',
      radius: 50
    },
    brandVoice: {
      tone: '',
      personality: [] as string[],
      values: [] as string[],
      style: ''
    },
    offer: {
      name: '',
      description: '',
      price: '',
      features: [''],
      benefits: [''],
      guarantee: ''
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: removed, ...rest } = prev
        return rest
      })
    }
  }

  const handleArrayChange = (field: keyof ProjectFormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item: string, i: number) => i === index ? value : item)
    }))
  }

  const handleAddArrayItem = (field: keyof ProjectFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }))
  }

  const handleRemoveArrayItem = (field: keyof ProjectFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_: string, i: number) => i !== index)
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      businessGoals: prev.businessGoals.includes(goal)
        ? prev.businessGoals.filter((g: string) => g !== goal)
        : [...prev.businessGoals, goal]
    }))
  }

  const handleNestedChange = (parent: 'brandVoice' | 'offer' | 'geographic', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleNestedArrayChange = (parent: 'brandVoice' | 'offer', field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: (prev[parent] as any)[field].map((item: any, i: number) => i === index ? value : item)
      }
    }))
  }

  const handleAddNestedArrayItem = (parent: 'brandVoice' | 'offer', field: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: [...prev[parent][field], '']
      }
    }))
  }

  const handleRemoveNestedArrayItem = (parent: 'brandVoice' | 'offer', field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: ((prev[parent] as any)[field] as any[]).filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required'
    if (!formData.businessDescription.trim() || formData.businessDescription.length < 10) {
      newErrors.businessDescription = 'Business description must be at least 10 characters'
    }
    if (!formData.industry) newErrors.industry = 'Industry is required'
    if (!formData.targetAudience.trim() || formData.targetAudience.length < 10) {
      newErrors.targetAudience = 'Target audience description must be at least 10 characters'
    }
    if (formData.businessGoals.length === 0) newErrors.businessGoals = 'At least one business goal is required'
    if (!formData.offer.name.trim()) newErrors['offerName'] = 'Offer name is required'
    if (!formData.offer.description.trim()) newErrors['offerDescription'] = 'Offer description is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      // Clean up form data
      const cleanData = {
        ...formData,
        competitorUrls: formData.competitorUrls.filter(url => url.trim()),
        brandVoice: {
          ...formData.brandVoice,
          vocabulary: formData.brandVoice.values.filter((v: string) => v.trim())
        },
        offer: {
          ...formData.offer,
          price: formData.offer.price ? parseFloat(formData.offer.price) : undefined,
          features: formData.offer.features.filter((f: string) => f.trim()),
          benefits: formData.offer.benefits.filter((b: string) => b.trim())
        }
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Project created successfully! AI funnel generation started.')
        router.push(`/projects/${result.data.id}`)
      } else {
        toast.error(result.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('An error occurred while creating the project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold">
                  Create New{" "}
                  <AnimatedGradientText>
                    AI Funnel
                  </AnimatedGradientText>
                </h1>
                <p className="text-muted-foreground">
                  Provide your business details and let AI create a high-converting funnel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Project Details */}
          <BorderBeam>
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Basic information about your funnel project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="My AI Funnel"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Your Business Name"
                      className={errors.businessName ? 'border-red-500' : ''}
                    />
                    {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business, what you do, and what makes you unique..."
                    rows={4}
                    className={errors.businessDescription ? 'border-red-500' : ''}
                  />
                  {errors.businessDescription && <p className="text-red-500 text-sm mt-1">{errors.businessDescription}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Industry *</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry: string) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
                  </div>
                  <div>
                    <Label htmlFor="monthlyRevenue">Monthly Revenue (Optional)</Label>
                    <Input
                      id="monthlyRevenue"
                      value={formData.monthlyRevenue}
                      onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                      placeholder="$10,000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience *</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Describe your ideal customers: demographics, interests, pain points, goals..."
                    rows={3}
                    className={errors.targetAudience ? 'border-red-500' : ''}
                  />
                  {errors.targetAudience && <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>}
                </div>

                {/* Geographic Scope */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Market Research Scope
                  </Label>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="geographic-scope"
                        value="auto"
                        checked={formData.geographic?.scope === 'auto'}
                        onChange={(e) => handleNestedChange('geographic', 'scope', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Auto-detect from business context</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="geographic-scope"
                        value="local"
                        checked={formData.geographic?.scope === 'local'}
                        onChange={(e) => handleNestedChange('geographic', 'scope', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Local market focus</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="geographic-scope"
                        value="national"
                        checked={formData.geographic?.scope === 'national'}
                        onChange={(e) => handleNestedChange('geographic', 'scope', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">National market</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="geographic-scope"
                        value="global"
                        checked={formData.geographic?.scope === 'global'}
                        onChange={(e) => handleNestedChange('geographic', 'scope', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Global market</span>
                    </label>
                  </div>
                  
                  {/* Local Options */}
                  {formData.geographic?.scope === 'local' && (
                    <div className="pl-6 space-y-3">
                      <div>
                        <Label className="block text-sm font-medium text-gray-600 mb-1">
                          Location (City, State, or Zip Code)
                        </Label>
                        <Input
                          type="text"
                          value={formData.geographic?.location || ''}
                          onChange={(e) => handleNestedChange('geographic', 'location', e.target.value)}
                          placeholder="e.g., Orlando, FL or 32801"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="block text-sm font-medium text-gray-600 mb-1">
                          Search Radius (miles)
                        </Label>
                        <Select
                          value={formData.geographic?.radius?.toString() || '50'}
                          onValueChange={(value) => handleNestedChange('geographic', 'radius', parseInt(value))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="25">25 miles</SelectItem>
                            <SelectItem value="50">50 miles</SelectItem>
                            <SelectItem value="100">100 miles</SelectItem>
                            <SelectItem value="200">200 miles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </BorderBeam>

          {/* Business Goals */}
          <BorderBeam delay={0.1}>
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Business Goals</CardTitle>
                <CardDescription>
                  What do you want to achieve with this funnel? (Select all that apply)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {businessGoals.map((goal: string) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.businessGoals.includes(goal)}
                        onCheckedChange={() => handleGoalToggle(goal)}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
                {errors.businessGoals && <p className="text-red-500 text-sm mt-2">{errors.businessGoals}</p>}
              </CardContent>
            </Card>
          </BorderBeam>

          {/* Competitors */}
          <BorderBeam delay={0.2}>
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>
                  Add competitor websites for AI analysis (optional but recommended)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.competitorUrls.map((url: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => handleArrayChange('competitorUrls', index, e.target.value)}
                        placeholder="https://competitor.com"
                        className="flex-1"
                      />
                      {formData.competitorUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveArrayItem('competitorUrls', index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddArrayItem('competitorUrls')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Competitor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </BorderBeam>

          {/* Brand Voice */}
          <BorderBeam delay={0.3}>
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Brand Voice</CardTitle>
                <CardDescription>
                  Define how your brand should communicate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Tone</Label>
                    <Select value={formData.brandVoice.tone || ''} onValueChange={(value) => handleNestedChange('brandVoice', 'tone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((tone: string) => (
                          <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Style</Label>
                    <Select value={formData.brandVoice.style || ''} onValueChange={(value) => handleNestedChange('brandVoice', 'style', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {styleOptions.map((style: string) => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Key Vocabulary/Phrases</Label>
                  <div className="space-y-2">
                    {formData.brandVoice.values.map((word: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={word}
                          onChange={(e) => handleNestedArrayChange('brandVoice', 'values', index, e.target.value)}
                          placeholder="Enter key words or phrases"
                          className="flex-1"
                        />
                        {formData.brandVoice.values.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveNestedArrayItem('brandVoice', 'values', index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNestedArrayItem('brandVoice', 'values')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Word/Phrase
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BorderBeam>

          {/* Offer Details */}
          <BorderBeam delay={0.4}>
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Offer Details</CardTitle>
                <CardDescription>
                  What are you selling or promoting through this funnel?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="offerName">Offer Name *</Label>
                    <Input
                      id="offerName"
                      value={formData.offer.name}
                      onChange={(e) => handleNestedChange('offer', 'name', e.target.value)}
                      placeholder="Your Product/Service Name"
                      className={errors.offerName ? 'border-red-500' : ''}
                    />
                    {errors.offerName && <p className="text-red-500 text-sm mt-1">{errors.offerName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="offerPrice">Price (Optional)</Label>
                    <Input
                      id="offerPrice"
                      type="number"
                      value={formData.offer.price}
                      onChange={(e) => handleNestedChange('offer', 'price', e.target.value)}
                      placeholder="97"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="offerDescription">Offer Description *</Label>
                  <Textarea
                    id="offerDescription"
                    value={formData.offer.description}
                    onChange={(e) => handleNestedChange('offer', 'description', e.target.value)}
                    placeholder="Describe your offer, what it includes, and why it's valuable..."
                    rows={4}
                    className={errors.offerDescription ? 'border-red-500' : ''}
                  />
                  {errors.offerDescription && <p className="text-red-500 text-sm mt-1">{errors.offerDescription}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Features</Label>
                    <div className="space-y-2">
                      {formData.offer.features.map((feature: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => handleNestedArrayChange('offer', 'features', index, e.target.value)}
                            placeholder="Feature description"
                            className="flex-1"
                          />
                          {formData.offer.features.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveNestedArrayItem('offer', 'features', index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNestedArrayItem('offer', 'features')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Benefits</Label>
                    <div className="space-y-2">
                      {formData.offer.benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => handleNestedArrayChange('offer', 'benefits', index, e.target.value)}
                            placeholder="Benefit description"
                            className="flex-1"
                          />
                          {formData.offer.benefits.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveNestedArrayItem('offer', 'benefits', index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNestedArrayItem('offer', 'benefits')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BorderBeam>

          {/* Submit */}
          <div className="flex justify-center">
            <ShimmerButton
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating AI Funnel...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create AI Funnel
                </>
              )}
            </ShimmerButton>
          </div>
        </form>
      </div>
    </div>
  )
}