interface ProjectData {
  businessName: string
  businessDescription: string
  industry: string
  targetAudience: string
  competitorUrls?: string[]
  geographicScope?: string
  geographicLocation?: string
  geographicRadius?: number
  monthlyRevenue?: string
}

export class ResearchPromptBuilder {
  private projectData: ProjectData

  constructor(projectData: ProjectData) {
    this.projectData = projectData
  }

  private inferGeographicContext(): string {
    const { businessName, businessDescription, geographicScope, geographicLocation, geographicRadius } = this.projectData

    // User explicitly set geographic scope
    if (geographicScope === 'local' && geographicLocation) {
      return `GEOGRAPHIC FOCUS: Local market analysis for ${geographicLocation} within ${geographicRadius} miles. Focus on local competitors, regional market conditions, and area-specific opportunities.`
    }
    
    if (geographicScope === 'national') {
      return `GEOGRAPHIC FOCUS: National market analysis. Focus on nationwide competitors, national market trends, and country-wide opportunities.`
    }
    
    if (geographicScope === 'global') {
      return `GEOGRAPHIC FOCUS: Global market analysis. Include international competitors, worldwide market trends, and global opportunities.`
    }

    // Auto-detect from business context
    const businessContext = `${businessName} ${businessDescription}`.toLowerCase()
    
    // Look for location indicators
    const locationIndicators = [
      { pattern: /central florida|orlando|tampa|jacksonville|miami/i, scope: 'local', location: 'Central Florida' },
      { pattern: /new york|nyc|brooklyn|manhattan/i, scope: 'local', location: 'New York area' },
      { pattern: /los angeles|la|california|san francisco/i, scope: 'local', location: 'California' },
      { pattern: /chicago|illinois|midwest/i, scope: 'local', location: 'Chicago/Midwest' },
      { pattern: /texas|dallas|houston|austin/i, scope: 'local', location: 'Texas' },
      { pattern: /local|regional|area|community/i, scope: 'local', location: 'regional market' },
      { pattern: /national|nationwide|usa|america/i, scope: 'national', location: 'United States' },
      { pattern: /global|international|worldwide|world/i, scope: 'global', location: 'global market' }
    ]

    for (const indicator of locationIndicators) {
      if (indicator.pattern.test(businessContext)) {
        if (indicator.scope === 'local') {
          return `GEOGRAPHIC FOCUS: Local/regional market analysis for ${indicator.location}. Focus on local competitors, regional market conditions, and area-specific opportunities.`
        } else if (indicator.scope === 'national') {
          return `GEOGRAPHIC FOCUS: National market analysis for ${indicator.location}. Focus on nationwide competitors and national market trends.`
        } else {
          return `GEOGRAPHIC FOCUS: Global market analysis. Include international competitors, worldwide market trends, and global opportunities.`
        }
      }
    }

    // Default to national if no indicators found
    return `GEOGRAPHIC FOCUS: National market analysis. Focus on nationwide competitors, national market trends, and country-wide opportunities.`
  }

  private buildCompetitorContext(): string {
    const { competitorUrls } = this.projectData
    
    if (!competitorUrls || competitorUrls.length === 0) {
      return ''
    }

    return `

CRITICAL COMPETITOR ANALYSIS:
You MUST analyze these specific competitors provided by the user: ${competitorUrls.join(', ')}

For EACH competitor URL:
1. Research their website and services thoroughly
2. Identify their target market and positioning
3. Analyze their strengths and weaknesses
4. Compare their offering to the user's business
5. Include them prominently in your competitor analysis section

Do NOT ignore these URLs. They are the user's primary competitors and must be included in your research.`
  }

  private buildIndustryContext(): string {
    const { industry, businessDescription } = this.projectData

    // Extract key business terms from description
    const description = businessDescription.toLowerCase()
    const businessKeywords: string[] = []

    // Common business type patterns
    const businessPatterns = [
      { pattern: /\b(ai|artificial intelligence|machine learning|automation)\b/g, keywords: ['AI', 'artificial intelligence', 'automation'] },
      { pattern: /\b(saas|software|platform|app|technology)\b/g, keywords: ['SaaS', 'software', 'technology platform'] },
      { pattern: /\b(marketing|advertising|digital marketing|seo)\b/g, keywords: ['marketing', 'digital marketing', 'advertising'] },
      { pattern: /\b(consulting|advisory|services|solutions)\b/g, keywords: ['consulting', 'professional services'] },
      { pattern: /\b(real estate|property|realty)\b/g, keywords: ['real estate', 'property management'] },
      { pattern: /\b(healthcare|medical|health|clinic)\b/g, keywords: ['healthcare', 'medical services'] },
      { pattern: /\b(finance|financial|accounting|bookkeeping)\b/g, keywords: ['financial services', 'accounting'] },
      { pattern: /\b(ecommerce|e-commerce|retail|store)\b/g, keywords: ['e-commerce', 'retail'] },
      { pattern: /\b(education|training|coaching|course)\b/g, keywords: ['education', 'training'] }
    ]

    businessPatterns.forEach(({ pattern, keywords }) => {
      if (pattern.test(description)) {
        businessKeywords.push(...keywords)
      }
    })

    const uniqueKeywords = [...new Set(businessKeywords)]
    
    if (uniqueKeywords.length > 0) {
      return `BUSINESS FOCUS: This business operates in ${industry} with specific focus on: ${uniqueKeywords.join(', ')}. Research competitors and market data relevant to these specific services, not generic ${industry} information.`
    }

    return `BUSINESS FOCUS: This business operates in ${industry}. Focus your research on the specific services described in the business description.`
  }

  buildPrompt(): string {
    const { businessName, businessDescription, targetAudience, monthlyRevenue } = this.projectData

    return `You are an expert market research analyst. Conduct comprehensive market research and return your findings as valid JSON in this EXACT format. Do not include any text before or after the JSON.

{
  "marketSize": {
    "value": "Detailed description of market size with specific numbers if available",
    "growth": "Growth rate and trend description", 
    "confidence": 0.85
  },
  "competitors": [
    {
      "name": "Competitor Company Name",
      "strengths": ["specific strength 1", "specific strength 2"],
      "weaknesses": ["specific weakness 1", "specific weakness 2"]
    }
  ],
  "trends": [
    {
      "trend": "Specific market trend name",
      "impact": "Detailed impact description",
      "timeframe": "When this trend is expected"
    }
  ],
  "opportunities": ["Specific market opportunity 1", "Specific market opportunity 2"],
  "challenges": ["Specific challenge or threat 1", "Specific challenge or threat 2"]
}

BUSINESS TO ANALYZE:
Company Name: ${businessName}
Business Description: ${businessDescription}
Target Audience: ${targetAudience}
Revenue Goal: ${monthlyRevenue || 'Not specified'}

${this.buildIndustryContext()}

${this.inferGeographicContext()}

${this.buildCompetitorContext()}

RESEARCH INSTRUCTIONS:
1. Use your web search capabilities to find current, relevant market data
2. Focus on the SPECIFIC business services described, not generic industry data
3. Ensure competitor analysis includes both discovered competitors AND user-provided URLs
4. Provide actionable insights relevant to the target audience specified
5. Consider the geographic scope when researching market size and competitors
6. Use recent data (2024-2025) when available

Return ONLY the JSON object, no additional text.`
  }
}