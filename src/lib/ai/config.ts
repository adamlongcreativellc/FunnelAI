import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { perplexity } from '@ai-sdk/perplexity'
import type { ModelConfig, AgentConfigMap, AgentType } from '@/types'

// 🎯 TIERED AI MODEL CONFIGURATION
// Default: Cost-optimized for free/basic users
// Premium: High-performance models for paid users

// DEFAULT TIER - Cost-optimized for all users
export const AI_MODELS: ModelConfig = {
  // Research: Keep your excellent choice! 
  research: perplexity('sonar-deep-research'),  // ✅ Perfect for research

  // Strategy: Latest and greatest for complex planning
  strategy: openai('gpt-4o'),                   // $2.50/$10 - Best strategic thinking
  
  // Content: Cost-effective creative writing  
  content: openai('gpt-4o-mini'),               // $0.15/$0.60 - 90% quality, massive savings
  
  // Persona: Anthropic excels at understanding humans
  persona: anthropic('claude-3-5-haiku'),       // $0.80/$4 - Great at personas, very cheap
  
  // Chat: Fast, cheap, conversational
  chat: openai('gpt-4o-mini'),                  // $0.15/$0.60 - Perfect for chat
  
  // Analysis: Balanced performance for data analysis
  analysis: anthropic('claude-3-5-sonnet'),     // $3/$15 - Excellent reasoning
  
  // Optimization: Cost-effective optimization logic
  optimization: openai('gpt-4o'),               // $2.50/$10 - Good optimization skills
  optimizer: openai('gpt-4o'),                  // Same as above
  
  // Fallback: Ultra-cheap emergency option
  fallback: openai('gpt-4o-mini'),              // $0.15/$0.60 - Reliable & cheap
}

// 🔧 TIER-AWARE AI CONFIGURATION
export const AI_CONFIG = {
  maxTokens: 4000,
  temperature: 0.7,
  topP: 0.9,
  maxRetries: 3,
  timeout: 60000,

  // Model-specific settings that adapt to user tier
  models: {
    research: {
      temperature: 0.3,
      maxTokens: {
        free: 4000,      // Standard research depth
        premium: 6000,   // More detailed research
        enterprise: 8000, // Comprehensive research
      },
      searchBudget: {
        free: 20,        // Limit searches for cost control
        premium: 50,     // More searches for better insights
        enterprise: 100, // Unlimited research depth
      }
    },
    
    content: {
      temperature: 0.8,
      maxTokens: {
        free: 2500,      // Good quality copy
        premium: 4000,   // Premium copy length
        enterprise: 6000, // Enterprise-grade content
      },
      variations: {
        free: 2,         // 2 copy variations
        premium: 5,      // 5 A/B test variations
        enterprise: 10,  // 10 variations for testing
      }
    },
    
    persona: {
      temperature: 0.6,
      maxTokens: {
        free: 2000,      // Basic personas
        premium: 3500,   // Detailed personas
        enterprise: 5000, // Comprehensive personas
      },
      personaCount: {
        free: 2,         // 2 personas per funnel
        premium: 4,      // 4 detailed personas
        enterprise: 6,   // 6 comprehensive personas
      }
    },
    
    chat: {
      temperature: 0.7,
      maxTokens: 2000,   // Same for all tiers
    },
    
    strategy: {
      temperature: 0.5,
      maxTokens: {
        free: 3000,      // Basic strategy
        premium: 5000,   // Advanced strategy
        enterprise: 7000, // Enterprise strategy
      }
    },
    
    analysis: {
      temperature: 0.4,
      maxTokens: {
        free: 2500,      // Basic analysis
        premium: 4000,   // Advanced analysis
        enterprise: 6000, // Deep analysis with reasoning
      }
    },
    
    optimizer: {
      temperature: 0.5,
      maxTokens: {
        free: 3000,      // Basic optimization
        premium: 5000,   // Advanced optimization
        enterprise: 7000, // Enterprise optimization
      }
    }
  }
} as const

// 🎯 TIER-BASED FEATURE FLAGS
export const TIER_FEATURES = {
  free: {
    aiModels: 'standard',
    maxFunnels: 10,
    researchDepth: 'basic',
    contentVariations: 2,
    personaCount: 2,
    supportLevel: 'email',
    analyticsAccess: false,
    customIntegrations: false,
  },
  premium: {
    aiModels: 'premium',
    maxFunnels: 100,
    researchDepth: 'advanced',
    contentVariations: 5,
    personaCount: 4,
    supportLevel: 'priority',
    analyticsAccess: true,
    customIntegrations: false,
  },
  enterprise: {
    aiModels: 'enterprise',
    maxFunnels: -1, // unlimited
    researchDepth: 'comprehensive',
    contentVariations: 10,
    personaCount: 6,
    supportLevel: 'dedicated',
    analyticsAccess: true,
    customIntegrations: true,
  }
} as const

// 🛠️ UTILITY FUNCTIONS FOR TIER MANAGEMENT
export function getUserTierConfig(userTier: UserTier) {
  return {
    models: getModelForUser(userTier),
    features: TIER_FEATURES[userTier],
    pricing: TIER_PRICING[userTier],
  }
}

export function canUserAccessFeature(userTier: UserTier, feature: keyof typeof TIER_FEATURES.free): boolean {
  return TIER_FEATURES[userTier][feature] !== false
}

export function getUserLimits(userTier: UserTier, setting: string) {
  const config = AI_CONFIG.models[setting as keyof typeof AI_CONFIG.models]
  if (config && typeof config === 'object' && 'maxTokens' in config) {
    const maxTokens = config.maxTokens
    if (typeof maxTokens === 'object') {
      return maxTokens[userTier]
    }
    return maxTokens
  }
  return AI_CONFIG.maxTokens
}

// 💡 COST ANALYSIS BY TIER
export const COST_ESTIMATES = {
  // Per funnel creation costs (estimated)
  free: {
    research: '$0.015',     // Basic Perplexity searches + cost-optimized models
    persona: '$0.005',      // Haiku is very cheap for personas
    content: '$0.001',      // GPT-4o-mini extremely cost-effective
    strategy: '$0.020',     // GPT-4o for strategy
    total: '$0.041',        // Total cost per funnel
  },
  
  premium: {
    research: '$0.035',     // More detailed research
    persona: '$0.015',      // Better persona models
    content: '$0.025',      // Premium content models
    strategy: '$0.035',     // Advanced strategy
    total: '$0.110',        // Total cost per funnel
  },
  
  enterprise: {
    research: '$0.050',     // Comprehensive research
    persona: '$0.025',      // Top-tier persona analysis
    content: '$0.040',      // Enterprise content generation
    strategy: '$0.055',     // Advanced strategy with reasoning
    total: '$0.170',        // Total cost per funnel
  },
  
  // Monthly revenue potential
  monthlyRevenue: {
    free: '$0 (acquisition cost)',
    premium: '$2,900 (100 users × $29)',
    enterprise: '$9,900 (100 users × $99)',
  },
  
  // Monthly costs for 100 users creating 10 funnels each
  monthlyCosts: {
    free: '$41 (1000 funnels × $0.041)',
    premium: '$110 (1000 funnels × $0.110)',
    enterprise: '$170 (1000 funnels × $0.170)',
  },
  
  // Profit margins (incredible!)
  profitMargins: {
    free: 'Cost center for acquisition',
    premium: '96% profit margin ($2,900 revenue - $110 costs)',
    enterprise: '98% profit margin ($9,900 revenue - $170 costs)',
  }
} as const

// 🚀 PREMIUM TIER - High-performance models (future monetization)
export const PREMIUM_AI_MODELS: ModelConfig = {
  research: perplexity('sonar-deep-research'),  // Keep the best research
  strategy: openai('gpt-4.1'),                  // Latest model for strategy
  content: openai('gpt-4o'),                    // Premium content generation
  persona: anthropic('claude-3-5-sonnet'),      // Superior persona analysis
  chat: openai('gpt-4o'),                       // Premium chat experience
  analysis: anthropic('claude-sonnet-4'),       // Top-tier reasoning
  optimization: openai('gpt-4.1'),              // Latest optimization
  optimizer: openai('gpt-4.1'),
  fallback: openai('gpt-4o'),                   // Premium fallback
}

// 💎 ENTERPRISE TIER - Ultimate performance (future enterprise sales)
export const ENTERPRISE_AI_MODELS: ModelConfig = {
  research: perplexity('sonar-deep-research'),  // Best research
  strategy: openai('gpt-4.1'),                  // Latest strategic thinking
  content: openai('gpt-4.1'),                   // Latest content generation
  persona: anthropic('claude-sonnet-4'),        // Top persona intelligence
  chat: openai('gpt-4.1'),                      // Best conversational AI
  analysis: openai('o4-mini'),                  // Reasoning model for complex analysis
  optimization: openai('gpt-4.1'),              // Latest optimization
  optimizer: openai('gpt-4.1'),
  fallback: openai('gpt-4o'),                   // Strong fallback
}

// 🏷️ USER TIER CONFIGURATION
export type UserTier = 'free' | 'premium' | 'enterprise'

export const TIER_CONFIGS = {
  free: AI_MODELS,
  premium: PREMIUM_AI_MODELS,
  enterprise: ENTERPRISE_AI_MODELS,
} as const

// 🎯 DYNAMIC MODEL SELECTION BASED ON USER TIER
export function getModelForUser(userTier: UserTier = 'free'): ModelConfig {
  return TIER_CONFIGS[userTier]
}

// 💰 PRICING STRATEGY (for future implementation)
export const TIER_PRICING = {
  free: {
    price: 0,
    funnelsPerMonth: 10,
    features: ['Basic AI models', 'Standard research', 'Email support'],
    costPerFunnel: '$0.05-0.15', // Your costs
  },
  premium: {
    price: 29, // $29/month
    funnelsPerMonth: 100,
    features: ['Premium AI models', 'Advanced research', 'Priority support', 'A/B testing'],
    costPerFunnel: '$0.15-0.35', // Your costs
  },
  enterprise: {
    price: 99, // $99/month
    funnelsPerMonth: 'unlimited',
    features: ['Enterprise AI models', 'Reasoning AI', 'Dedicated support', 'Custom integrations'],
    costPerFunnel: '$0.25-0.50', // Your costs
  },
} as const

// Agent Capabilities Definition (unchanged - your setup was excellent)
export const AGENT_CAPABILITIES = {
  research: {
    name: 'Market Research Agent',
    description: 'Conducts comprehensive market analysis and competitive research',
    tools: ['web_search', 'data_analysis', 'trend_detection', 'competitor_analysis'],
    expertise: ['market_sizing', 'competitor_analysis', 'trend_identification', 'opportunity_detection']
  },
  
  persona: {
    name: 'Customer Persona Agent', 
    description: 'Creates detailed customer personas and behavioral analysis',
    tools: ['demographic_analysis', 'psychographic_modeling', 'behavior_prediction'],
    expertise: ['customer_segmentation', 'behavioral_psychology', 'user_journey_mapping']
  },
  
  content: {
    name: 'Content Generation Agent',
    description: 'Generates high-converting copy and content variations',
    tools: ['copywriting', 'a_b_testing', 'conversion_optimization', 'headline_generation'],
    expertise: ['persuasive_writing', 'conversion_copywriting', 'content_optimization']
  },
  
  strategy: {
    name: 'Funnel Strategy Agent',
    description: 'Designs optimal funnel strategies and user flows',
    tools: ['funnel_analysis', 'conversion_prediction', 'optimization_recommendations'],
    expertise: ['funnel_optimization', 'conversion_psychology', 'user_experience']
  },
  
  optimizer: {
    name: 'Performance Optimization Agent',
    description: 'Analyzes and optimizes funnel performance',
    tools: ['performance_analysis', 'bottleneck_detection', 'improvement_suggestions'],
    expertise: ['conversion_rate_optimization', 'analytics_interpretation', 'performance_tuning']
  }
} as const

export type { AgentType } from '@/types'