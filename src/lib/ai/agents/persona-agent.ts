import { z } from 'zod'
import { BaseAgent, type AgentTask, type AgentResult } from './base-agent'

// Schemas for persona data
const DemographicsSchema = z.object({
  age: z.string().describe("Age range (e.g., '25-35')"),
  gender: z.string().describe("Gender distribution or primary gender"),
  income: z.string().describe("Income range (e.g., '$45,000-$75,000')"),
  education: z.string().describe("Education level"),
  occupation: z.string().describe("Job title or career field"),
  location: z.string().describe("Geographic location (city/region type)"),
  familyStatus: z.string().describe("Marital status and family situation"),
  householdSize: z.string().optional().describe("Number of people in household")
})

const PsychographicsSchema = z.object({
  values: z.array(z.string()).describe("Core values and beliefs"),
  interests: z.array(z.string()).describe("Hobbies and interests"),
  lifestyle: z.string().describe("Lifestyle description"),
  personality: z.array(z.string()).describe("Personality traits"),
  motivations: z.array(z.string()).describe("Key motivators and drivers"),
  fears: z.array(z.string()).describe("Concerns and anxieties"),
  aspirations: z.array(z.string()).describe("Goals and dreams"),
  mediaConsumption: z.array(z.string()).describe("Preferred media and content types")
})

const BehaviorPatternsSchema = z.object({
  purchaseDecisionFactors: z.array(z.string()).describe("Key factors influencing purchases"),
  researchBehavior: z.string().describe("How they research before buying"),
  purchaseFrequency: z.string().describe("How often they make purchases"),
  brandLoyalty: z.string().describe("Level of brand loyalty"),
  pricesensitivity: z.enum(['low', 'medium', 'high']).describe("Sensitivity to pricing"),
  preferredChannels: z.array(z.string()).describe("Preferred shopping/communication channels"),
  deviceUsage: z.array(z.string()).describe("Primary devices used"),
  socialMediaBehavior: z.string().describe("How they use social media")
})

const PersonaSchema = z.object({
  name: z.string().describe("Persona name (first name)"),
  tagline: z.string().describe("One-line description of the persona"),
  demographics: DemographicsSchema,
  psychographics: PsychographicsSchema,
  behaviorPatterns: BehaviorPatternsSchema,
  painPoints: z.array(z.string()).describe("Key problems and frustrations"),
  goals: z.array(z.string()).describe("What they want to achieve"),
  motivations: z.array(z.string()).describe("What drives their decisions"),
  frustrations: z.array(z.string()).describe("What annoys or blocks them"),
  preferredCommunication: z.array(z.string()).describe("How they like to be communicated with"),
  contentPreferences: z.array(z.string()).describe("Types of content they engage with"),
  buyingTriggers: z.array(z.string()).describe("What triggers a purchase decision"),
  objections: z.array(z.string()).describe("Common objections or hesitations"),
  influencers: z.array(z.string()).describe("Who influences their decisions"),
  customerJourney: z.object({
    awareness: z.string().describe("How they become aware of solutions"),
    consideration: z.string().describe("How they evaluate options"),
    decision: z.string().describe("How they make the final decision"),
    retention: z.string().describe("What keeps them as customers")
  }),
  marketingMessages: z.array(z.string()).describe("Key messages that resonate"),
  confidenceScore: z.number().min(0).max(1).describe("Confidence in persona accuracy")
})

const PersonaSetSchema = z.object({
  personas: z.array(PersonaSchema),
  primaryPersona: z.string().describe("Name of the primary persona"),
  segmentationInsights: z.array(z.string()).describe("Key insights about market segmentation"),
  recommendedApproach: z.string().describe("Recommended marketing approach for these personas")
})

export class PersonaAgent extends BaseAgent {
  constructor() {
    super('persona')
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'generate_personas':
        return this.generatePersonas(task)
      case 'analyze_persona':
        return this.analyzePersona(task)
      case 'validate_personas':
        return this.validatePersonas(task)
      case 'persona_messaging':
        return this.generatePersonaMessaging(task)
      default:
        return {
          success: false,
          error: `Unknown task type: ${task.type}`
        }
    }
  }

  private async generatePersonas(task: AgentTask): Promise<AgentResult> {
    const { 
      marketResearch, 
      businessDescription, 
      targetAudience, 
      industry,
      competitorData,
      targetCount = 3 
    } = task.input

    const prompt = `Based on the following information, create ${targetCount} detailed customer personas for this business:

Business Context:
- Industry: ${industry}
- Business Description: ${businessDescription}
- Target Audience: ${targetAudience}

Market Research Data:
${marketResearch ? JSON.stringify(marketResearch, null, 2) : 'No market research data provided'}

Competitor Data:
${competitorData ? JSON.stringify(competitorData, null, 2) : 'No competitor data provided'}

Create ${targetCount} distinct personas that represent the primary customer segments for this business. Each persona should be:

1. Based on real demographic and psychographic data
2. Detailed enough to guide marketing decisions
3. Distinct from other personas (no overlap)
4. Actionable for funnel design and messaging

For each persona, include:
- Complete demographic profile
- Detailed psychographic analysis
- Behavioral patterns and preferences
- Pain points and frustrations
- Goals and motivations
- Communication preferences
- Content consumption habits
- Buying triggers and objections
- Customer journey mapping
- Recommended marketing messages

Ensure one persona is designated as the primary target (highest value/volume potential).`

    return this.generateStructuredResponse(prompt, PersonaSetSchema, task.context)
  }

  private async analyzePersona(task: AgentTask): Promise<AgentResult> {
    const { persona, businessGoals, marketContext } = task.input

    const prompt = `Analyze the following customer persona in detail and provide actionable insights:

Persona Data:
${JSON.stringify(persona, null, 2)}

Business Goals:
${businessGoals?.join(', ') || 'Not specified'}

Market Context:
${marketContext || 'Not provided'}

Provide a comprehensive analysis including:

1. Persona Validation
   - How realistic is this persona based on market data?
   - Are there any gaps or inconsistencies?
   - What additional research might be needed?

2. Marketing Strategy Recommendations
   - Best channels to reach this persona
   - Optimal messaging approach
   - Content strategy recommendations
   - Timing and frequency suggestions

3. Funnel Design Insights
   - Optimal funnel flow for this persona
   - Key conversion points to focus on
   - Potential friction points to address
   - Personalization opportunities

4. Product/Service Fit
   - How well does the offering match persona needs?
   - Potential product improvements or variations
   - Pricing strategy considerations
   - Feature prioritization guidance

5. Competitive Positioning
   - How to differentiate for this persona
   - Competitive vulnerabilities to exploit
   - Unique value propositions to emphasize`

    const PersonaAnalysisSchema = z.object({
      validation: z.object({
        realismScore: z.number().min(0).max(1),
        gaps: z.array(z.string()),
        researchNeeds: z.array(z.string())
      }),
      marketingStrategy: z.object({
        recommendedChannels: z.array(z.string()),
        messagingApproach: z.string(),
        contentStrategy: z.array(z.string()),
        timingRecommendations: z.string()
      }),
      funnelDesign: z.object({
        optimalFlow: z.array(z.string()),
        conversionPoints: z.array(z.string()),
        frictionPoints: z.array(z.string()),
        personalizationOpportunities: z.array(z.string())
      }),
      productFit: z.object({
        fitScore: z.number().min(0).max(1),
        improvements: z.array(z.string()),
        pricingStrategy: z.string(),
        featurePriorities: z.array(z.string())
      }),
      competitivePositioning: z.object({
        differentiationStrategies: z.array(z.string()),
        competitiveAdvantages: z.array(z.string()),
        uniqueValueProps: z.array(z.string())
      })
    })

    return this.generateStructuredResponse(prompt, PersonaAnalysisSchema, task.context)
  }

  private async validatePersonas(task: AgentTask): Promise<AgentResult> {
    const { personas, realWorldData, industryBenchmarks } = task.input

    const prompt = `Validate these customer personas against real-world data and industry benchmarks:

Personas to Validate:
${JSON.stringify(personas, null, 2)}

Real-World Data:
${realWorldData ? JSON.stringify(realWorldData, null, 2) : 'No real-world data provided'}

Industry Benchmarks:
${industryBenchmarks ? JSON.stringify(industryBenchmarks, null, 2) : 'No benchmark data provided'}

For each persona, evaluate:

1. Data Accuracy
   - Do demographics align with industry data?
   - Are psychographics realistic for the target market?
   - Do behavioral patterns match known customer behavior?

2. Market Viability
   - Is the segment large enough to be viable?
   - Does the persona represent a real market opportunity?
   - Are there similar personas in competitor research?

3. Actionability
   - Is the persona detailed enough for marketing decisions?
   - Can this persona be effectively targeted?
   - Are the insights specific and actionable?

4. Completeness
   - Are all key persona elements covered?
   - Are there missing data points that would be valuable?
   - How could the persona be improved?

Provide validation scores and specific recommendations for improvement.`

    const ValidationSchema = z.object({
      personaValidations: z.array(z.object({
        personaName: z.string(),
        accuracyScore: z.number().min(0).max(1),
        viabilityScore: z.number().min(0).max(1),
        actionabilityScore: z.number().min(0).max(1),
        completenessScore: z.number().min(0).max(1),
        overallScore: z.number().min(0).max(1),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        improvements: z.array(z.string())
      })),
      overallAssessment: z.string(),
      recommendations: z.array(z.string())
    })

    return this.generateStructuredResponse(prompt, ValidationSchema, task.context)
  }

  private async generatePersonaMessaging(task: AgentTask): Promise<AgentResult> {
    const { persona, businessOffering, competitiveContext } = task.input

    const prompt = `Create targeted messaging for this customer persona:

Persona:
${JSON.stringify(persona, null, 2)}

Business Offering:
${businessOffering}

Competitive Context:
${competitiveContext || 'Not provided'}

Generate specific messaging for:

1. Awareness Stage
   - Headlines that grab attention
   - Problem identification messaging
   - Educational content themes

2. Consideration Stage
   - Value proposition statements
   - Feature/benefit messaging
   - Social proof angles
   - Comparison messaging

3. Decision Stage
   - Urgency and scarcity messaging
   - Trust and credibility messaging
   - Objection handling
   - Call-to-action variations

4. Retention Stage
   - Onboarding messaging
   - Success celebration
   - Upsell/cross-sell messaging
   - Loyalty building

5. Channel-Specific Messaging
   - Social media posts
   - Email subject lines and copy
   - Ad copy variations
   - Website copy blocks

Ensure all messaging:
- Speaks directly to persona pain points and goals
- Uses their preferred language and tone
- Addresses their specific objections
- Leverages their motivations and triggers`

    const MessagingSchema = z.object({
      awareness: z.object({
        headlines: z.array(z.string()),
        problemStatements: z.array(z.string()),
        contentThemes: z.array(z.string())
      }),
      consideration: z.object({
        valuePropositions: z.array(z.string()),
        benefitStatements: z.array(z.string()),
        socialProof: z.array(z.string()),
        comparisons: z.array(z.string())
      }),
      decision: z.object({
        urgencyMessages: z.array(z.string()),
        trustSignals: z.array(z.string()),
        objectionHandlers: z.array(z.string()),
        callsToAction: z.array(z.string())
      }),
      retention: z.object({
        onboardingMessages: z.array(z.string()),
        successMessages: z.array(z.string()),
        upsellMessages: z.array(z.string()),
        loyaltyMessages: z.array(z.string())
      }),
      channelSpecific: z.object({
        socialMedia: z.array(z.string()),
        emailSubjects: z.array(z.string()),
        adCopy: z.array(z.string()),
        websiteCopy: z.array(z.string())
      })
    })

    return this.generateStructuredResponse(prompt, MessagingSchema, task.context)
  }
}