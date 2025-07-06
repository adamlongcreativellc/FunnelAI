export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: string[]
}

export interface PaginationParams {
  page: number
  limit: number
  status?: string
  search?: string
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  companyName?: string
  companySize?: string
  industry?: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
  trialEndsAt?: string
  onboardingCompleted: boolean
  preferences: Record<string, any>
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  businessType?: string
  targetMarket?: string
  status: 'draft' | 'researching' | 'generating' | 'completed' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface MarketResearch {
  id: string
  projectId: string
  marketSize: number
  growthRate: number
  competitors: Competitor[]
  opportunities: string[]
  threats: string[]
  confidenceScore: number
  sources: string[]
  createdAt: string
}

export interface Competitor {
  name: string
  strengths: string[]
  weaknesses: string[]
  marketShare?: number
  url?: string
}

export interface Persona {
  id: string
  projectId: string
  name: string
  demographics: Demographics
  psychographics: Psychographics
  painPoints: string[]
  goals: string[]
  preferredChannels: string[]
  isPrimary: boolean
  createdAt: string
}

export interface Demographics {
  age: string
  income: string
  location: string
  education: string
  occupation?: string
  familyStatus?: string
}

export interface Psychographics {
  values: string[]
  interests: string[]
  lifestyle: string
  personality?: string[]
  motivations?: string[]
}

export interface Content {
  id: string
  projectId: string
  personaId?: string
  type: 'headline' | 'subheadline' | 'copy' | 'cta' | 'email' | 'ad'
  content: string
  metadata?: Record<string, any>
  performance?: {
    conversionRate?: number
    clickThroughRate?: number
    engagementRate?: number
  }
  createdAt: string
  updatedAt: string
}

export interface FunnelPage {
  id: string
  projectId: string
  type: 'landing' | 'product' | 'checkout' | 'thank-you' | 'email'
  name: string
  content: PageContent
  conversionRate?: number
  variants: PageVariant[]
  createdAt: string
  updatedAt: string
}

export interface PageContent {
  headline: string
  subheadline?: string
  copy: string
  cta: string
  images?: string[]
  videos?: string[]
  forms?: FormField[]
}

export interface PageVariant {
  id: string
  name: string
  content: PageContent
  trafficPercentage: number
  conversionRate?: number
  isWinner?: boolean
}

export interface FormField {
  name: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface ABTest {
  id: string
  projectId: string
  name: string
  description?: string
  testType: 'headline' | 'cta' | 'layout' | 'copy' | 'image'
  variants: TestVariant[]
  status: 'draft' | 'running' | 'completed' | 'paused'
  winnerVariantId?: string
  confidenceLevel?: number
  minSampleSize: number
  maxDurationDays: number
  significanceThreshold: number
  startedAt?: string
  endedAt?: string
  createdAt: string
}

export interface TestVariant {
  id: string
  name: string
  content: Record<string, any>
  trafficPercentage: number
  conversions: number
  visitors: number
  conversionRate: number
}

export interface Analytics {
  totalVisitors: number
  totalConversions: number
  conversionRate: number
  revenueGenerated: number
  averageOrderValue: number
  trafficSources: TrafficSource[]
  deviceBreakdown: DeviceBreakdown
  timeSeriesData: TimeSeriesPoint[]
}

export interface TrafficSource {
  source: string
  visitors: number
  conversions: number
  conversionRate: number
}

export interface DeviceBreakdown {
  desktop: number
  mobile: number
  tablet: number
}

export interface TimeSeriesPoint {
  date: string
  visitors: number
  conversions: number
  revenue: number
}