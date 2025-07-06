import { z } from 'zod'
import { BaseAgent, type AgentTask, type AgentResult } from './base-agent'

// Schemas for content generation
const ContentVariationSchema = z.object({
  headline: z.string().describe("Main headline"),
  subheadline: z.string().optional().describe("Supporting subheadline"),
  bodyContent: z.string().describe("Main body content"),
  callToAction: z.string().describe("Call-to-action text"),
  urgencyElement: z.string().optional().describe("Urgency or scarcity element"),
  trustSignals: z.array(z.string()).describe("Trust and credibility elements"),
  socialProof: z.string().optional().describe("Social proof statement"),
  metadata: z.object({
    tone: z.string(),
    readingLevel: z.string(),
    wordCount: z.number(),
    emotionalAppeal: z.array(z.string()),
    persuasionTechniques: z.array(z.string())
  })
})

const LandingPageContentSchema = z.object({
  variations: z.array(ContentVariationSchema).min(3).max(5),
  recommendedVariation: z.string().describe("Which variation is recommended and why"),
  testingStrategy: z.string().describe("How to A/B test these variations"),
  optimizationNotes: z.array(z.string()).describe("Additional optimization suggestions")
})

const EmailSequenceSchema = z.object({
  emails: z.array(z.object({
    subject: z.string(),
    preview: z.string(),
    content: z.string(),
    callToAction: z.string(),
    sendDelay: z.string().describe("When to send (e.g., 'immediately', '1 day', '3 days')"),
    purpose: z.string().describe("Purpose of this email in the sequence")
  })),
  sequenceStrategy: z.string().describe("Overall strategy and flow of the sequence"),
  personalizationTips: z.array(z.string()).describe("How to personalize for different segments")
})

const AdCopySchema = z.object({
  platform: z.string(),
  variations: z.array(z.object({
    headline: z.string(),
    description: z.string(),
    callToAction: z.string(),
    targetingNotes: z.string().describe("Suggested targeting for this variation")
  })),
  visualSuggestions: z.array(z.string()).describe("Suggested visuals or creative elements"),
  budgetRecommendations: z.string().describe("Budget and bidding strategy recommendations")
})

export class ContentAgent extends BaseAgent {
  constructor() {
    super('content')
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'generate_landing_page':
        return this.generateLandingPageContent(task)
      case 'generate_email_sequence':
        return this.generateEmailSequence(task)
      case 'generate_ad_copy':
        return this.generateAdCopy(task)
      case 'optimize_content':
        return this.optimizeContent(task)
      case 'generate_headlines':
        return this.generateHeadlines(task)
      default:
        return {
          success: false,
          error: `Unknown task type: ${task.type}`
        }
    }
  }

  private async generateLandingPageContent(task: AgentTask): Promise<AgentResult> {
    const { 
      persona, 
      offer, 
      brandVoice, 
      pageType = 'lead_generation',
      competitiveContext 
    } = task.input

    const prompt = `Create high-converting landing page content for this specific persona and offer:

Target Persona:
${JSON.stringify(persona, null, 2)}

Offer Details:
${JSON.stringify(offer, null, 2)}

Brand Voice:
${brandVoice ? JSON.stringify(brandVoice, null, 2) : 'Professional, trustworthy, and customer-focused'}

Page Type: ${pageType}

Competitive Context:
${competitiveContext || 'Not provided'}

Create 3-5 different content variations for A/B testing. Each variation should:

1. Speak directly to the persona's pain points and goals
2. Highlight the most relevant benefits for this persona
3. Use language and tone that resonates with their communication preferences
4. Address their specific objections and concerns
5. Include appropriate urgency and social proof elements
6. Have a clear, compelling call-to-action

Variation Guidelines:
- Variation 1: Pain-focused approach (highlight problems)
- Variation 2: Benefit-focused approach (highlight solutions)
- Variation 3: Social proof focused (testimonials, reviews)
- Variation 4: Urgency/scarcity focused
- Variation 5: Authority/expertise focused

Each variation should include:
- Compelling headline (8-12 words)
- Supporting subheadline (15-25 words)
- Body content (100-200 words)
- Strong call-to-action (2-4 words)
- Trust signals and social proof
- Urgency elements where appropriate

Consider conversion psychology principles:
- Reciprocity, commitment, social proof, authority, liking, scarcity
- Clear value proposition
- Risk reversal or guarantee
- Benefit-driven copy over feature-focused
- Emotional triggers matched to persona motivations`

    return this.generateStructuredResponse(prompt, LandingPageContentSchema, task.context)
  }

  private async generateEmailSequence(task: AgentTask): Promise<AgentResult> {
    const { 
      persona, 
      sequenceType = 'nurture', 
      sequenceLength = 5,
      businessGoals,
      offer 
    } = task.input

    const prompt = `Create a ${sequenceLength}-email sequence of type "${sequenceType}" for this persona:

Target Persona:
${JSON.stringify(persona, null, 2)}

Business Goals:
${businessGoals?.join(', ') || 'Not specified'}

Offer/Product:
${JSON.stringify(offer, null, 2)}

Sequence Type: ${sequenceType}
- If "welcome": Onboarding new subscribers
- If "nurture": Building relationship and trust
- If "sales": Converting prospects to customers  
- If "abandoned_cart": Recovering abandoned purchases
- If "re_engagement": Reactivating inactive subscribers

Create ${sequenceLength} emails that:

1. Follow a logical progression and storytelling arc
2. Each email has a specific purpose in the customer journey
3. Content is tailored to the persona's preferences and behavior
4. Subject lines are compelling and persona-appropriate
5. Preview text complements the subject line
6. Content provides value while moving toward the goal
7. Clear call-to-action in each email
8. Appropriate timing between emails

Email Structure Guidelines:
- Subject: 30-50 characters, curiosity-driven
- Preview: 35-90 characters, complements subject
- Content: 150-300 words, scannable format
- CTA: Clear, action-oriented, benefit-focused
- Personal touches that match persona preferences

Sequence Flow:
- Email 1: Welcome/hook (immediate)
- Email 2: Value delivery (1-2 days)
- Email 3: Social proof/stories (2-3 days)
- Email 4: Educational content (3-4 days) 
- Email 5: Strong offer/CTA (5-7 days)

Adjust timing and content based on sequence type and persona behavior patterns.`

    return this.generateStructuredResponse(prompt, EmailSequenceSchema, task.context)
  }

  private async generateAdCopy(task: AgentTask): Promise<AgentResult> {
    const { 
      platform, 
      persona, 
      offer, 
      budget,
      campaign_objective = 'conversions' 
    } = task.input

    const prompt = `Create high-performing ad copy for ${platform} targeting this persona:

Platform: ${platform}
Campaign Objective: ${campaign_objective}
Budget: ${budget || 'Not specified'}

Target Persona:
${JSON.stringify(persona, null, 2)}

Offer Details:
${JSON.stringify(offer, null, 2)}

Create 3-5 ad variations optimized for ${platform} with these considerations:

Platform-Specific Requirements:
${this.getPlatformGuidelines(platform)}

Ad Copy Guidelines:
1. Headlines that stop the scroll and grab attention
2. Descriptions that clearly communicate value
3. CTAs that drive the desired action
4. Copy that speaks to persona motivations
5. Social proof elements where appropriate
6. Urgency/scarcity when relevant

For each variation, consider:
- Different emotional triggers (fear, desire, curiosity, urgency)
- Various value propositions (time-saving, money-saving, status, convenience)
- Different angles (problem-solution, before-after, testimonial, educational)
- Appropriate tone for the persona and platform
- Compliance with platform advertising policies

Include targeting recommendations:
- Demographics that match the persona
- Interest-based targeting suggestions
- Behavioral targeting opportunities
- Custom audience recommendations
- Lookalike audience strategies

Provide visual suggestions that would complement the copy and appeal to the persona.`

    return this.generateStructuredResponse(prompt, AdCopySchema, task.context)
  }

  private async optimizeContent(task: AgentTask): Promise<AgentResult> {
    const { 
      currentContent, 
      performanceData, 
      persona, 
      improvementGoals 
    } = task.input

    const prompt = `Analyze and optimize this existing content based on performance data:

Current Content:
${JSON.stringify(currentContent, null, 2)}

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Target Persona:
${JSON.stringify(persona, null, 2)}

Improvement Goals:
${improvementGoals?.join(', ') || 'Increase conversions'}

Provide detailed optimization recommendations:

1. Content Analysis
   - What's working well (based on performance data)
   - What's underperforming and why
   - Persona alignment assessment
   - Conversion psychology audit

2. Specific Improvements
   - Headline optimization suggestions
   - Copy flow and structure improvements
   - Call-to-action optimization
   - Trust signal enhancements
   - Visual hierarchy recommendations

3. A/B Testing Recommendations
   - Priority elements to test first
   - Specific test variations to try
   - Success metrics to track
   - Testing timeline and methodology

4. Persona Alignment
   - How well content matches persona preferences
   - Language and tone adjustments needed
   - Messaging gaps to address
   - Additional value props to highlight

5. Conversion Optimization
   - Friction points to remove
   - Persuasion elements to add
   - Social proof opportunities
   - Risk reversal strategies

Provide before/after examples where helpful and prioritize recommendations by expected impact.`

    const OptimizationSchema = z.object({
      analysis: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        personaAlignment: z.number().min(0).max(1),
        conversionPotential: z.number().min(0).max(1)
      }),
      improvements: z.array(z.object({
        element: z.string(),
        currentVersion: z.string(),
        optimizedVersion: z.string(),
        reasoning: z.string(),
        expectedImpact: z.enum(['low', 'medium', 'high'])
      })),
      abTestPlan: z.object({
        priorityTests: z.array(z.object({
          testName: z.string(),
          hypothesis: z.string(),
          variations: z.array(z.string()),
          successMetric: z.string(),
          duration: z.string()
        }))
      }),
      implementationPlan: z.array(z.object({
        priority: z.enum(['high', 'medium', 'low']),
        task: z.string(),
        effort: z.string(),
        impact: z.string()
      }))
    })

    return this.generateStructuredResponse(prompt, OptimizationSchema, task.context)
  }

  private async generateHeadlines(task: AgentTask): Promise<AgentResult> {
    const { 
      persona, 
      offer, 
      headlineType = 'benefit',
      quantity = 10 
    } = task.input

    const prompt = `Generate ${quantity} high-converting headlines of type "${headlineType}" for this persona and offer:

Target Persona:
${JSON.stringify(persona, null, 2)}

Offer Details:
${JSON.stringify(offer, null, 2)}

Headline Type: ${headlineType}
${this.getHeadlineTypeGuidelines(headlineType)}

Create ${quantity} headlines that:

1. Immediately grab the persona's attention
2. Speak to their primary pain points or desires
3. Clearly communicate the main benefit or value
4. Use language and tone that resonates with them
5. Are optimized for the specific headline type
6. Are scannable and easy to understand
7. Create curiosity or urgency where appropriate

Headline Formulas to Consider:
- How to [achieve desired outcome] without [common obstacle]
- The [number] [thing] that [benefit] 
- [Time period] to [desired outcome]
- Why [target audience] are [doing something] to [achieve result]
- The secret to [desired outcome] that [authority figure] don't want you to know
- [Desired outcome] in [time period] (even if [common objection])

Each headline should be:
- 6-12 words for maximum impact
- Benefit-focused rather than feature-focused
- Emotionally compelling
- Specific and concrete
- Easy to understand at a glance

Provide headlines ranked by expected performance with brief reasoning for each.`

    const HeadlineSchema = z.object({
      headlines: z.array(z.object({
        text: z.string(),
        type: z.string(),
        emotionalTrigger: z.string(),
        targetBenefit: z.string(),
        expectedPerformance: z.enum(['high', 'medium', 'low']),
        reasoning: z.string()
      })),
      recommendations: z.array(z.string()).describe("General recommendations for headline optimization")
    })

    return this.generateStructuredResponse(prompt, HeadlineSchema, task.context)
  }

  private getPlatformGuidelines(platform: string): string {
    const guidelines: { [key: string]: string } = {
      facebook: "Headlines: 25 chars, Primary text: 125 chars, Description: 27 chars. Focus on visual storytelling and social context.",
      google: "Headlines: 30 chars each (3 total), Descriptions: 90 chars each (2 total). Focus on search intent and keyword relevance.",
      linkedin: "Headlines: 25 chars, Text: 150 chars. Professional tone, B2B focus, value-driven messaging.",
      instagram: "Captions: 125 chars visible, Stories: 1-2 sentences. Visual-first, lifestyle-oriented, authentic voice.",
      twitter: "280 chars total including CTA. Concise, engaging, hashtag optimization.",
      youtube: "Titles: 60 chars, Descriptions: 125 chars visible. Entertainment value, curiosity-driven."
    }
    
    return guidelines[platform.toLowerCase()] || "Follow platform best practices for character limits and content guidelines."
  }

  private getHeadlineTypeGuidelines(type: string): string {
    const guidelines: { [key: string]: string } = {
      benefit: "Focus on the primary benefit or outcome the persona will receive",
      curiosity: "Create intrigue and make the reader want to learn more",
      urgency: "Emphasize time-sensitivity or limited availability", 
      social_proof: "Leverage testimonials, numbers, or social validation",
      problem: "Highlight a pain point or problem the persona faces",
      solution: "Present your offer as the solution to their problem",
      how_to: "Educational approach showing how to achieve desired outcome",
      list: "Numbered lists of benefits, tips, or features",
      question: "Thought-provoking questions that engage the reader",
      news: "Newsworthy or announcement-style headlines"
    }
    
    return guidelines[type] || "Create compelling headlines that resonate with your target persona"
  }
}