import { z } from 'zod'
import { BaseAgent, type AgentTask, type AgentResult } from './base-agent'
import { generateObject } from 'ai'
import { AI_MODELS } from '../config'

function isError(error: unknown): error is Error {
  return error instanceof Error
}

function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  return typeof error === 'string' ? error : 'Unknown error occurred'
}

function getErrorName(error: unknown): string {
  if (isError(error)) {
    return error.name
  }
  return 'UnknownError'
}

// Schemas for research data
const CompetitorSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  marketShare: z.number().optional(),
  pricingStrategy: z.string().optional(),
  targetAudience: z.string().optional()
})

const MarketResearchSchema = z.object({
  marketSize: z.number().describe("Total addressable market size in USD"),
  growthRate: z.number().describe("Annual market growth rate as decimal (e.g., 0.05 for 5%)"),
  keyTrends: z.array(z.string()).describe("Major market trends affecting the industry"),
  competitors: z.array(CompetitorSchema).describe("Top 3-5 competitors analysis"),
  opportunities: z.array(z.string()).describe("Market opportunities to exploit"),
  threats: z.array(z.string()).describe("Potential market threats"),
  customerSegments: z.array(z.object({
    name: z.string(),
    size: z.string(),
    characteristics: z.array(z.string())
  })).describe("Key customer segments"),
  pricePoints: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number()
  }).describe("Typical price points in the market"),
  barriers: z.array(z.string()).describe("Barriers to entry"),
  recommendations: z.array(z.string()).describe("Strategic recommendations based on research"),
  confidenceScore: z.number().min(0).max(1).describe("Confidence level in the research (0-1)")
})

const TrendAnalysisSchema = z.object({
  emergingTrends: z.array(z.object({
    trend: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    timeframe: z.string(),
    description: z.string()
  })),
  decliningTrends: z.array(z.string()),
  stableTrends: z.array(z.string()),
  disruptiveTechnologies: z.array(z.string()),
  consumerBehaviorShifts: z.array(z.string())
})

export class ResearchAgent extends BaseAgent {
  constructor() {
    super('research')
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'market_analysis':
        return this.conductMarketAnalysis(task)
      case 'competitor_analysis':
        return this.analyzeCompetitors(task)
      case 'trend_analysis':
        return this.analyzeTrends(task)
      case 'opportunity_assessment':
        return this.assessOpportunities(task)
      default:
        return {
          success: false,
          error: `Unknown task type: ${task.type}`
        }
    }
  }

  private async conductMarketAnalysis(task: AgentTask): Promise<AgentResult> {
    const { industry, targetAudience, businessGoals, competitorUrls } = task.input

    try {
      // Use Perplexity for real-time market research
      const perplexityQuery = `Market research for ${industry} industry targeting ${targetAudience} in 2024. Include market size, growth rate, top competitors, opportunities, threats, customer segments, and pricing strategies. Use specific numbers and recent data.`
      
      const perplexityResponse = await this.queryPerplexity(perplexityQuery)
      
      // Now use AI to structure the Perplexity data into our schema
      const structurePrompt = `Based on this real market research data from Perplexity, structure it into a comprehensive market analysis:

REAL MARKET DATA:
${perplexityResponse.content}

Business Context:
- Industry: ${industry}
- Target Audience: ${targetAudience}
- Business Goals: ${businessGoals?.join(', ') || 'Not specified'}
- Competitors to analyze: ${competitorUrls?.join(', ') || 'Analyze competitors mentioned in the data'}

Please structure this real market data into a comprehensive analysis including specific numbers, growth rates, competitor details, and actionable insights for funnel strategy and positioning.

IMPORTANT: Use the actual market data provided above, don't generate fictional data.`

      const result = await generateObject({
        model: AI_MODELS.research,
        prompt: structurePrompt,
        schema: MarketResearchSchema,
        system: this.getSystemPrompt(),
        temperature: 0.3 // Lower temperature for more factual analysis
      })

      return {
        success: true,
        data: result.object,
        metadata: {
          tokensUsed: result.usage?.totalTokens,
          processingTime: Date.now(),
          sources: perplexityResponse.citations || [],
          confidence: this.calculateConfidence(result.object)
        }
      }
    } catch (error) {
      console.error('Market analysis error:', getErrorMessage(error))
      
      // Fallback to AI-only research if Perplexity fails
      const fallbackPrompt = `Conduct a comprehensive market analysis for a business in the ${industry} industry targeting ${targetAudience}. Provide realistic estimates and industry-standard data where possible.`
      
      return this.generateStructuredResponse(fallbackPrompt, MarketResearchSchema, task.context)
    }
  }

  private async queryPerplexity(query: string): Promise<{ content: string; citations?: string[] }> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/research/perplexity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        content: data.content,
        citations: data.citations
      }
    } catch (error) {
      console.error('Perplexity query failed:', error)
      throw error
    }
  }

  private async analyzeCompetitors(task: AgentTask): Promise<AgentResult> {
    const { competitors, industry, targetAudience } = task.input

    try {
      let scrapedData = ''
      
      // If competitors are URLs, scrape them with Firecrawl
      if (competitors && competitors.length > 0) {
        const isUrl = (str: string) => {
          try {
            new URL(str)
            return true
          } catch {
            return false
          }
        }

        const competitorUrls = competitors.filter(isUrl)
        
        if (competitorUrls.length > 0) {
          console.log('Scraping competitor websites:', competitorUrls)
          
          const scrapingPromises = competitorUrls.slice(0, 5).map(async (url: string) => {
            try {
              const scraped = await this.scrapeCompetitorWebsite(url)
              return {
                url,
                success: scraped.success,
                content: scraped.content?.substring(0, 3000), // Limit content size
                metadata: scraped.metadata
              }
            } catch (error) {
              console.error(`Failed to scrape ${url}:`, getErrorMessage(error))
              return { url, success: false, error: getErrorMessage(error) }
            }
          })

          const scrapingResults = await Promise.allSettled(scrapingPromises)
          const successfulScrapes = scrapingResults
            .filter(result => result.status === 'fulfilled' && result.value.success)
            .map(result => result.status === 'fulfilled' ? result.value : null)
            .filter(Boolean)

          if (successfulScrapes.length > 0) {
            scrapedData = `SCRAPED COMPETITOR WEBSITE DATA:
${successfulScrapes.map(scrape => `
URL: ${scrape.url}
Title: ${scrape.metadata?.title || 'N/A'}
Content: ${scrape.content}
---`).join('\n')}`
          }
        }
      }

      // Also get general market intelligence from Perplexity
      const perplexityQuery = `Analyze top competitors in the ${industry} industry targeting ${targetAudience}. Include market share, strengths, weaknesses, pricing strategies, and competitive advantages. Focus on 2024 data.`
      const perplexityResponse = await this.queryPerplexity(perplexityQuery)

      const prompt = `Analyze competitors in the ${industry} industry targeting ${targetAudience}.

${scrapedData ? `${scrapedData}\n\n` : ''}

MARKET INTELLIGENCE:
${perplexityResponse.content}

COMPETITORS TO ANALYZE:
${competitors.map((comp: string, index: number) => `${index + 1}. ${comp}`).join('\n')}

Based on the scraped website data and market intelligence above, provide a comprehensive competitive analysis including:
1. Company overview and positioning for each competitor
2. Target audience and market segment analysis
3. Key strengths and competitive advantages
4. Weaknesses and vulnerabilities
5. Pricing strategy and business model insights
6. Marketing and funnel strategies observed
7. Market share estimation
8. Competitive gaps and opportunities
9. Market positioning recommendations
10. Differentiation strategies
11. Competitive response strategies

IMPORTANT: Use the actual scraped website data and market intelligence provided above to inform your analysis.`

    const CompetitorAnalysisSchema = z.object({
      competitors: z.array(CompetitorSchema),
      marketGaps: z.array(z.string()),
      positioningRecommendations: z.array(z.string()),
      differentiationStrategies: z.array(z.string()),
      competitiveAdvantages: z.array(z.string())
    })

    const result = await generateObject({
      model: AI_MODELS.research,
      prompt: prompt,
      schema: CompetitorAnalysisSchema,
      system: this.getSystemPrompt(),
      temperature: 0.3
    })

    return {
      success: true,
      data: result.object,
      metadata: {
        tokensUsed: result.usage?.totalTokens,
        processingTime: Date.now(),
        sources: [...(perplexityResponse.citations || []), ...competitors.filter((c: string) => c.startsWith('http'))],
        confidence: this.calculateConfidence(result.object)
      }
    }

    } catch (error) {
      console.error('Competitor analysis error:', getErrorMessage(error))
      
      // Fallback to AI-only analysis
      const fallbackPrompt = `Analyze competitors in the ${industry} industry targeting ${targetAudience}. Provide realistic competitive intelligence based on industry knowledge.`
      
      const CompetitorAnalysisSchema = z.object({
        competitors: z.array(CompetitorSchema),
        marketGaps: z.array(z.string()),
        positioningRecommendations: z.array(z.string()),
        differentiationStrategies: z.array(z.string()),
        competitiveAdvantages: z.array(z.string())
      })

      return this.generateStructuredResponse(fallbackPrompt, CompetitorAnalysisSchema, task.context)
    }
  }

  private async scrapeCompetitorWebsite(url: string): Promise<{
    success: boolean;
    content?: string;
    metadata?: any;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/research/firecrawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          options: {
            formats: ['markdown'],
            onlyMainContent: true,
            excludeTags: ['nav', 'footer', 'sidebar', 'ads', 'script', 'style']
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: data.success,
        content: data.content,
        metadata: data.metadata,
        error: data.error
      }
    } catch (error) {
      console.error('Website scraping failed:', getErrorMessage(error))
      return {
        success: false,
        error: getErrorMessage(error)
      }
    }
  }

  private async analyzeTrends(task: AgentTask): Promise<AgentResult> {
    const { industry, timeframe = '12 months' } = task.input

    const prompt = `Analyze current and emerging trends in the ${industry} industry over the next ${timeframe}.

Focus on:
1. Technology trends affecting the industry
2. Consumer behavior changes and preferences
3. Regulatory changes and their impact
4. Economic factors influencing the market
5. Social and cultural trends
6. Competitive landscape evolution
7. Emerging business models
8. Disruptive technologies and innovations

Categorize trends by:
- Impact level (low, medium, high)
- Time to adoption
- Certainty level
- Opportunity for new entrants

Provide specific examples and data where possible.`

    return this.generateStructuredResponse(prompt, TrendAnalysisSchema, task.context)
  }

  private async assessOpportunities(task: AgentTask): Promise<AgentResult> {
    const { marketData, competitorData, businessProfile } = task.input

    const prompt = `Based on the following data, identify and assess market opportunities:

Market Data:
${JSON.stringify(marketData, null, 2)}

Competitor Data:
${JSON.stringify(competitorData, null, 2)}

Business Profile:
${JSON.stringify(businessProfile, null, 2)}

Identify:
1. Underserved market segments
2. Product/service gaps in the market
3. Emerging customer needs
4. Technology adoption opportunities
5. Partnership opportunities
6. Geographic expansion potential
7. New distribution channels
8. Pricing optimization opportunities

For each opportunity, provide:
- Market size and potential
- Competition level
- Barriers to entry
- Investment required
- Timeline to market
- Risk assessment
- Success probability`

    const OpportunitySchema = z.object({
      opportunities: z.array(z.object({
        title: z.string(),
        description: z.string(),
        marketSize: z.number(),
        competitionLevel: z.enum(['low', 'medium', 'high']),
        barriers: z.array(z.string()),
        timeline: z.string(),
        successProbability: z.number().min(0).max(1),
        requiredInvestment: z.string(),
        potentialROI: z.string()
      })),
      priorityMatrix: z.array(z.object({
        opportunity: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        reasoning: z.string()
      }))
    })

    return this.generateStructuredResponse(prompt, OpportunitySchema, task.context)
  }
}