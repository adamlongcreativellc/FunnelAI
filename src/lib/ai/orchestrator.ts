import { z } from 'zod'
import { ResearchAgent } from './agents/research-agent'
import { PersonaAgent } from './agents/persona-agent'
import { ContentAgent } from './agents/content-agent'
import { BaseAgent, type AgentContext, type AgentResult } from './agents/base-agent'
import { prisma } from '@/lib/prisma'

// Define union type for agents
type AgentUnion = ResearchAgent | PersonaAgent | ContentAgent

// Schemas for funnel creation
const FunnelCreationInputSchema = z.object({
  businessName: z.string(),
  businessDescription: z.string(),
  industry: z.string(),
  targetAudience: z.string(),
  businessGoals: z.array(z.string()),
  monthlyRevenue: z.string().optional(),
  competitorUrls: z.array(z.string()).optional(),
  brandVoice: z.object({
    tone: z.string(),
    style: z.string(),
    vocabulary: z.array(z.string())
  }).optional(),
  offer: z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().optional(),
    features: z.array(z.string()),
    benefits: z.array(z.string())
  })
})

const FunnelOutputSchema = z.object({
  marketResearch: z.any(),
  personas: z.array(z.any()),
  contentVariations: z.any(),
  funnelStrategy: z.any(),
  estimatedConversionRate: z.number(),
  recommendations: z.array(z.string())
})

export interface WorkflowProgress {
  stage: string
  progress: number
  message: string
  estimatedTimeRemaining?: number
}

export type ProgressCallback = (progress: WorkflowProgress) => void

export class AIOrchestrator {
  private agents: Map<string, AgentUnion>
  private activeWorkflows: Map<string, boolean> = new Map()

  constructor() {
    this.agents = new Map<string, AgentUnion>()
    this.agents.set('research', new ResearchAgent())
    this.agents.set('persona', new PersonaAgent())
    this.agents.set('content', new ContentAgent())
  }

  async createFunnel(
    input: z.infer<typeof FunnelCreationInputSchema>,
    context: AgentContext,
    onProgress?: ProgressCallback
  ): Promise<AgentResult> {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`
    this.activeWorkflows.set(workflowId, true)

    try {
      // Validate input
      const validatedInput = FunnelCreationInputSchema.parse(input)
      
      // Create AI job record
      const aiJob = await prisma.aiJob.create({
        data: {
          userId: context.userId,
          projectId: context.projectId,
          jobType: 'funnel_creation',
          status: 'running',
          inputData: validatedInput
        }
      })

      const updateProgress = (stage: string, progress: number, message: string, estimatedTime?: number) => {
        onProgress?.({ stage, progress, message, estimatedTimeRemaining: estimatedTime })
        
        // Update job progress in database
        prisma.aiJob.update({
          where: { id: aiJob.id },
          data: { progress: Math.round(progress) }
        }).catch(console.error) // Don't await to avoid blocking
      }

      // Step 1: Market Research (0-25%)
      updateProgress('research', 5, 'Starting market research...', 180)
      
      const researchAgent = this.agents.get('research')!
      const marketResearchResult = await researchAgent.execute({
        type: 'market_analysis',
        input: {
          industry: validatedInput.industry,
          targetAudience: validatedInput.targetAudience,
          businessGoals: validatedInput.businessGoals,
          competitorUrls: validatedInput.competitorUrls
        },
        context
      })

      if (!marketResearchResult.success) {
        throw new Error(`Market research failed: ${marketResearchResult.error}`)
      }

      updateProgress('research', 25, 'Market research completed', 150)

      // Step 2: Persona Generation (25-50%)
      updateProgress('persona', 30, 'Generating customer personas...', 120)

      const personaAgent = this.agents.get('persona')!
      const personaResult = await personaAgent.execute({
        type: 'generate_personas',
        input: {
          marketResearch: marketResearchResult.data,
          businessDescription: validatedInput.businessDescription,
          targetAudience: validatedInput.targetAudience,
          industry: validatedInput.industry,
          targetCount: 3
        },
        context
      })

      if (!personaResult.success) {
        throw new Error(`Persona generation failed: ${personaResult.error}`)
      }

      updateProgress('persona', 50, 'Customer personas created', 90)

      // Step 3: Content Generation (50-80%)
      updateProgress('content', 55, 'Generating funnel content...', 60)

      const contentAgent = this.agents.get('content')!
      const primaryPersona = personaResult.data.personas.find((p: any) => p.name === personaResult.data.primaryPersona)
      
      const contentResult = await contentAgent.execute({
        type: 'generate_landing_page',
        input: {
          persona: primaryPersona,
          offer: validatedInput.offer,
          brandVoice: validatedInput.brandVoice,
          pageType: 'lead_generation'
        },
        context
      })

      if (!contentResult.success) {
        throw new Error(`Content generation failed: ${contentResult.error}`)
      }

      updateProgress('content', 80, 'Content variations generated', 30)

      // Step 4: Strategy & Optimization (80-95%)
      updateProgress('strategy', 85, 'Optimizing funnel strategy...', 15)

      const funnelStrategy = await this.generateFunnelStrategy({
        marketResearch: marketResearchResult.data,
        personas: personaResult.data.personas,
        contentVariations: contentResult.data,
        businessGoals: validatedInput.businessGoals,
        industry: validatedInput.industry
      })

      updateProgress('strategy', 95, 'Finalizing recommendations...', 5)

      // Step 5: Final Assembly (95-100%)
      const finalResult = {
        marketResearch: marketResearchResult.data,
        personas: personaResult.data.personas,
        contentVariations: contentResult.data,
        funnelStrategy,
        estimatedConversionRate: this.calculateEstimatedConversionRate(funnelStrategy, marketResearchResult.data),
        recommendations: this.generateRecommendations({
          marketResearch: marketResearchResult.data,
          personas: personaResult.data.personas,
          strategy: funnelStrategy
        })
      }

      // Update job as completed
      await prisma.aiJob.update({
        where: { id: aiJob.id },
        data: {
          status: 'completed',
          progress: 100,
          resultData: finalResult,
          completedAt: new Date()
        }
      })

      updateProgress('complete', 100, 'Funnel generation complete!', 0)

      return {
        success: true,
        data: finalResult,
        metadata: {
          processingTime: Date.now() - parseInt(workflowId.split('-')[1]),
          tokensUsed: this.calculateTotalTokensUsed([marketResearchResult, personaResult, contentResult])
        }
      }

    } catch (error) {
      console.error(`Workflow ${workflowId} failed:`, error)
      
      // Update job as failed
      if (context.projectId) {
        await prisma.aiJob.updateMany({
          where: {
            userId: context.userId,
            projectId: context.projectId,
            status: 'running'
          },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Funnel creation failed'
      }
    } finally {
      this.activeWorkflows.delete(workflowId)
    }
  }

  async optimizeExistingFunnel(
    projectId: string,
    optimizationType: 'conversion' | 'content' | 'personas' | 'strategy',
    context: AgentContext,
    onProgress?: ProgressCallback
  ): Promise<AgentResult> {
    try {
      // Get existing project data
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          marketResearchData: true,
          personaData: true,
          pages: true
        }
      })

      if (!project) {
        return { success: false, error: 'Project not found' }
      }

      onProgress?.({ stage: 'analysis', progress: 10, message: 'Analyzing current funnel...' })

      switch (optimizationType) {
        case 'content':
          return this.optimizeContent(project, context, onProgress)
        case 'conversion':
          return this.optimizeConversion(project, context, onProgress)
        case 'personas':
          return this.optimizePersonas(project, context, onProgress)
        case 'strategy':
          return this.optimizeStrategy(project, context, onProgress)
        default:
          return { success: false, error: 'Unknown optimization type' }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Optimization failed'
      }
    }
  }

  private async generateFunnelStrategy(data: any): Promise<any> {
    // Strategy generation logic
    const { marketResearch, personas, contentVariations, businessGoals, industry } = data

    return {
      funnelType: this.determineFunnelType(businessGoals, industry),
      userFlow: this.generateUserFlow(personas),
      conversionOptimization: this.generateConversionOptimization(marketResearch, personas),
      testingStrategy: this.generateTestingStrategy(contentVariations),
      kpiTargets: this.generateKPITargets(marketResearch, industry),
      implementationPlan: this.generateImplementationPlan()
    }
  }

  private calculateEstimatedConversionRate(strategy: any, marketResearch: any): number {
    // Conversion rate estimation logic based on industry benchmarks and strategy
    const industryBaseline = this.getIndustryBaseline(marketResearch.industry)
    const strategyMultiplier = this.getStrategyMultiplier(strategy)
    
    return Math.min(industryBaseline * strategyMultiplier, 0.25) // Cap at 25%
  }

  private generateRecommendations(data: any): string[] {
    const { marketResearch, personas, strategy } = data
    
    return [
      'Focus on the primary persona for initial testing',
      'Implement A/B testing for headline variations',
      'Add social proof elements based on competitor analysis',
      'Consider implementing exit-intent popups',
      'Optimize for mobile-first experience',
      `Target the ${marketResearch.opportunities[0]} opportunity identified in research`
    ]
  }

  private async optimizeContent(project: any, context: AgentContext, onProgress?: ProgressCallback): Promise<AgentResult> {
    onProgress?.({ stage: 'content', progress: 20, message: 'Analyzing content performance...' })
    
    const contentAgent = this.agents.get('content')!
    return contentAgent.execute({
      type: 'optimize_content',
      input: {
        currentContent: project.contentVariations,
        performanceData: {
          conversionRate: project.actualConversionRate,
          visitors: project.totalVisitors
        },
        persona: project.personas?.[0],
        improvementGoals: ['increase_conversions', 'reduce_bounce_rate']
      },
      context
    })
  }

  private async optimizeConversion(project: any, context: AgentContext, onProgress?: ProgressCallback): Promise<AgentResult> {
    // Conversion optimization logic
    onProgress?.({ stage: 'conversion', progress: 50, message: 'Optimizing conversion flow...' })
    
    return {
      success: true,
      data: {
        recommendations: [
          'Add urgency elements to CTA buttons',
          'Implement trust badges',
          'Optimize form fields',
          'Add exit-intent popup'
        ]
      }
    }
  }

  private async optimizePersonas(project: any, context: AgentContext, onProgress?: ProgressCallback): Promise<AgentResult> {
    onProgress?.({ stage: 'personas', progress: 30, message: 'Refining customer personas...' })
    
    const personaAgent = this.agents.get('persona')!
    return personaAgent.execute({
      type: 'validate_personas',
      input: {
        personas: project.personas,
        realWorldData: {
          conversionRate: project.actualConversionRate,
          visitorData: project.totalVisitors
        }
      },
      context
    })
  }

  private async optimizeStrategy(project: any, context: AgentContext, onProgress?: ProgressCallback): Promise<AgentResult> {
    // Strategy optimization logic
    onProgress?.({ stage: 'strategy', progress: 70, message: 'Optimizing funnel strategy...' })
    
    return {
      success: true,
      data: {
        strategy: await this.generateFunnelStrategy({
          marketResearch: project.marketResearch,
          personas: project.personas,
          contentVariations: project.contentVariations,
          businessGoals: project.businessGoals,
          industry: project.industry
        })
      }
    }
  }

  // Helper methods
  private determineFunnelType(goals: string[], industry: string): string {
    if (goals.includes('lead_generation')) return 'lead_generation'
    if (goals.includes('ecommerce')) return 'ecommerce'
    if (goals.includes('saas_trial')) return 'saas_trial'
    return 'general_conversion'
  }

  private generateUserFlow(personas: any[]): any[] {
    return [
      { stage: 'awareness', touchpoints: ['social_media', 'search'], persona_focus: personas[0]?.name },
      { stage: 'interest', touchpoints: ['landing_page', 'content'], persona_focus: personas[0]?.name },
      { stage: 'decision', touchpoints: ['demo', 'trial'], persona_focus: personas[0]?.name },
      { stage: 'action', touchpoints: ['signup', 'purchase'], persona_focus: personas[0]?.name }
    ]
  }

  private generateConversionOptimization(marketResearch: any, personas: any[]): any {
    return {
      primaryOptimizations: ['headline_testing', 'cta_optimization', 'social_proof'],
      secondaryOptimizations: ['form_optimization', 'mobile_experience'],
      testingPriority: ['headline', 'cta', 'offer', 'layout']
    }
  }

  private generateTestingStrategy(contentVariations: any): any {
    return {
      testSequence: ['headline_test', 'cta_test', 'layout_test'],
      duration: '2_weeks_per_test',
      sampleSize: 1000,
      significance: 0.95
    }
  }

  private generateKPITargets(marketResearch: any, industry: string): any {
    const baseline = this.getIndustryBaseline(industry)
    return {
      conversionRate: baseline * 1.2,
      costPerAcquisition: marketResearch.averageCPA * 0.8,
      customerLifetimeValue: marketResearch.averageLTV * 1.1
    }
  }

  private generateImplementationPlan(): any {
    return {
      phase1: 'Setup tracking and baseline measurement',
      phase2: 'Implement primary optimizations',
      phase3: 'A/B testing and iterations',
      phase4: 'Scale and expand'
    }
  }

  private getIndustryBaseline(industry: string): number {
    const baselines: Record<string, number> = {
      'ecommerce': 0.02,
      'saas': 0.03,
      'education': 0.05,
      'finance': 0.015,
      'healthcare': 0.025,
      'default': 0.025
    }
    return baselines[industry.toLowerCase()] || baselines.default
  }

  private getStrategyMultiplier(strategy: any): number {
    // Calculate multiplier based on strategy quality
    let multiplier = 1.0
    
    if (strategy.conversionOptimization?.primaryOptimizations?.length >= 3) multiplier += 0.3
    if (strategy.testingStrategy?.testSequence?.length >= 3) multiplier += 0.2
    if (strategy.userFlow?.length >= 4) multiplier += 0.1
    
    return multiplier
  }

  private calculateTotalTokensUsed(results: AgentResult[]): number {
    return results.reduce((total, result) => {
      return total + (result.metadata?.tokensUsed || 0)
    }, 0)
  }
}