// Core Business Types
export interface BusinessInfo {
  name: string;
  businessName: string;
  businessDescription: string;
  industry: string;
  targetAudience: string;
  businessGoals: string[];
  monthlyRevenue: string;
  competitorUrls: string[];
  geographic?: {
    scope: 'auto' | 'local' | 'national' | 'global';
    location?: string;
    radius?: number;
  };
}

export interface BrandVoice {
  [key: string]: any;
  tone: string;
  personality: string[];
  values: string[];
  style?: string;
}

export interface Offer {
  [key: string]: any;
  name: string;
  description: string;
  price: string;
  features: string[];
  benefits: string[];
  guarantee: string;
}

// Form Data Types
export interface ProjectFormData extends BusinessInfo {
  brandVoice: BrandVoice;
  offer: Offer;
}

// Market Research Types
export interface MarketResearch {
  industry: string;
  marketSize: string;
  growthRate: number; // Changed to number for arithmetic operations
  keyTrends: string[];
  targetDemographic: string;
  competitors: Array<{ name: string; url?: string }>; // Changed from mainCompetitors
  opportunities: string[]; // Added top-level opportunities
  recommendations: string[]; // Added top-level recommendations
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    recommendations: string[];
  };
}

// Customer Persona Types
export interface CustomerPersona {
  name: string;
  title: string; // Added missing title
  age: string;
  occupation: string;
  income: string;
  lifestyle: string;
  goals: string[];
  challenges: string[];
  values: string[];
  buyingBehavior: string;
  preferredChannels: string[];
  demographics: { // Added missing demographics
    age: string;
    income: string;
    location: string;
    education: string;
  };
  painPoints: string[]; // Added top-level painPoints
  motivations: string[]; // Added top-level motivations
  psychographics: {
    painPoints: string[];
    motivations: string[];
    objections: string[];
    decisionFactors: string[];
  };
}

// Funnel Types
export interface FunnelStage {
  name: string;
  goal: string;
  description: string; // Added missing description
  content: string;
  cta: string;
  objectives: string[]; // Added missing objectives
  metrics: string[];
}

export interface EmailSequence {
  subject: string;
  preview: string;
  body: string;
  cta: string;
}

export interface FunnelContent {
  hook: {
    headline: string;
    subheadline: string;
    openingStatement: string;
  };
  problem: {
    statement: string;
    symptoms: string[];
    consequences: string[];
  };
  solution: {
    introduction: string;
    mechanism: string;
    benefits: string[];
    proof: string[];
  };
  credibility: {
    founderStory: string;
    credentials: string[];
    testimonials: string[];
    caseStudies: string[];
  };
  offer: {
    valueProposition: string;
    components: string[];
    pricing: {
      strategy: string;
      justification: string;
      urgency: string;
    };
    bonuses: string[];
    guarantee: string;
  };
  urgency: {
    reason: string;
    scarcity: string;
    deadline: string;
  };
  cta: {
    primary: string;
    secondary: string;
    reassurance: string;
  };
  emailSequence: EmailSequence[];
}

// Content Types
export interface ContentPiece {
  type: 'facebook' | 'google' | 'linkedin' | 'instagram' | 'twitter' | 'youtube';
  format: string;
  hook: string;
  body: string;
  cta: string;
  hashtags?: string[];
  imagePrompt?: string;
}

export interface ContentCalendar {
  week: number;
  theme: string;
  posts: Array<{
    day: string;
    platform: string;
    content: ContentPiece;
  }>;
}

// Strategy Types
export interface MarketingRecommendations {
  positioning: string;
  messaging: {
    keyMessages: string[];
    valueProps: string[];
    differentiators: string[];
  };
  channels: {
    primary: string[];
    secondary: string[];
    reasoning: string[];
  };
  contentStrategy: {
    themes: string[];
    formats: string[];
    frequency: string;
  };
  nextSteps: string[];
}

export interface MarketingStrategy {
  objectives: string[];
  targetAudience: {
    primary: string;
    secondary: string;
  };
  positioning: string;
  messaging: {
    coreMessage: string;
    supportingMessages: string[];
  };
  funnelStrategy: FunnelStage[];
  recommendations: MarketingRecommendations;
}

// Project Types
export interface Project extends BusinessInfo {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'archived' | 'researching' | 'generating' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  publishedAt?: Date; // Added missing publishedAt
  description?: string; // Added missing description
  actualConversionRate?: number; // Added missing actualConversionRate
  estimatedConversionRate?: number; // Added missing estimatedConversionRate
  totalVisitors?: number; // Added missing totalVisitors
  totalConversions?: number; // Added missing totalConversions
  revenueGenerated?: number; // Added missing revenueGenerated
  // Geographic fields from database
  geographicScope?: string;
  geographicLocation?: string;
  geographicRadius?: number;
  marketResearch?: MarketResearch;
  personas?: CustomerPersona[];
  strategy?: MarketingStrategy;
  funnelContent?: FunnelContent;
  contentCalendar?: ContentCalendar[];
  contentVariations?: any; // Added missing contentVariations
  funnelStrategy?: any; // Added missing funnelStrategy
  brandVoice: BrandVoice;
  offer: Offer;
}

// Agent System Types
export type AgentType = 'research' | 'persona' | 'strategy' | 'content' | 'optimizer';

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  imageSettings?: {
    quality: string;
    size: string;
    style: string;
  };
}

export interface ModelConfig {
  research: any; // LanguageModelV1
  strategy: any; // LanguageModelV1
  content: any; // LanguageModelV1
  persona: any; // LanguageModelV1
  chat: any; // LanguageModelV1
  fallback: any; // LanguageModelV1
  analysis: any; // LanguageModelV1
  optimization: any; // LanguageModelV1
  optimizer: any; // LanguageModelV1
}

export interface AgentConfigMap {
  research: AgentConfig;
  content: AgentConfig;
  persona: AgentConfig;
  chat: AgentConfig;
  strategy: AgentConfig;
  optimizer: AgentConfig;
}

// Base Agent Interface
export interface BaseAgent {
  agentType: AgentType;
  execute(context: any): Promise<any>;
}

// Specific Agent Interfaces
export interface ResearchAgent extends BaseAgent {
  agentType: 'research';
  conductMarketAnalysis(businessInfo: BusinessInfo): Promise<MarketResearch>;
  queryPerplexity(query: string): Promise<any>;
  analyzeCompetitors(urls: string[]): Promise<any>;
  scrapeCompetitorWebsite(url: string): Promise<any>;
  generateInsights(data: any): Promise<any>;
}

export interface PersonaAgent extends BaseAgent {
  agentType: 'persona';
  generatePersonas(businessInfo: BusinessInfo, marketResearch: MarketResearch): Promise<CustomerPersona[]>;
}

export interface StrategyAgent extends BaseAgent {
  agentType: 'strategy';
  createStrategy(businessInfo: BusinessInfo, marketResearch: MarketResearch, personas: CustomerPersona[]): Promise<MarketingStrategy>;
}

export interface ContentAgent extends BaseAgent {
  agentType: 'content';
  generateFunnelContent(project: Project): Promise<FunnelContent>;
  createContentCalendar(project: Project): Promise<ContentCalendar[]>;
}

export interface OptimizerAgent extends BaseAgent {
  agentType: 'optimizer';
  optimizeContent(content: any, metrics: any): Promise<any>;
}

// Union type for all agents
export type Agent = ResearchAgent | PersonaAgent | StrategyAgent | ContentAgent | OptimizerAgent;

// Workflow Types
export interface WorkflowContext {
  project: Project;
  workflowId?: string;
}

export interface WorkflowResult {
  tokensUsed?: number;
  processingTime?: number;
  confidence?: number;
  sources?: string[];
  workflowId?: string;
  data: any;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type FixedLengthArray<T, N extends number> = T[] & { length: N };

// Content Platform Types
export const CONTENT_PLATFORMS = ['facebook', 'google', 'linkedin', 'instagram', 'twitter', 'youtube'] as const;
export type ContentPlatform = typeof CONTENT_PLATFORMS[number];

// Hook Framework Types
export const HOOK_FRAMEWORKS = [
  'benefit',
  'curiosity',
  'urgency',
  'social_proof',
  'problem',
  'solution',
  'how_to',
  'list',
  'question',
  'news'
] as const;
export type HookFramework = typeof HOOK_FRAMEWORKS[number];

// Index signature types for dynamic access
export interface PlatformTemplateMap {
  [key: string]: string;
  facebook: string;
  google: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface HookTemplateMap {
  [key: string]: string;
  benefit: string;
  curiosity: string;
  urgency: string;
  social_proof: string;
  problem: string;
  solution: string;
  how_to: string;
  list: string;
  question: string;
  news: string;
}