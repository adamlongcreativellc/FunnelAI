import { generateObject, generateText } from 'ai'
import { AI_MODELS, AI_CONFIG, AGENT_CAPABILITIES, type AgentType } from '../config'
import { z } from 'zod'

export interface AgentContext {
  userId: string
  projectId?: string
  sessionId: string
  metadata?: Record<string, any>
}

export interface AgentTask {
  type: string
  input: any
  schema?: z.ZodSchema
  context: AgentContext
}

export interface AgentResult<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    tokensUsed?: number
    processingTime?: number
    confidence?: number
    sources?: string[]
  }
}

export abstract class BaseAgent {
  protected agentType: AgentType
  protected model: any
  protected capabilities: typeof AGENT_CAPABILITIES[AgentType]

  constructor(agentType: AgentType) {
    this.agentType = agentType
    this.model = AI_MODELS[agentType] || AI_MODELS.fallback
    this.capabilities = AGENT_CAPABILITIES[agentType]
  }

  private resolveConfigValue(value: any, userTier: string = 'free'): any {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value[userTier] || value.free || Object.values(value)[0]
    }
    return value
  }

  private getResolvedModelConfig(userTier: string = 'free') {
    const baseConfig = this.getModelConfig()
    return {
      ...baseConfig,
      maxTokens: this.resolveConfigValue(baseConfig.maxTokens, userTier),
      temperature: this.resolveConfigValue(baseConfig.temperature, userTier)
    }
  }

  abstract execute(task: AgentTask): Promise<AgentResult>

  protected async generateStructuredResponse<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    context: AgentContext
  ): Promise<AgentResult<T>> {
    const startTime = Date.now()
    
    try {
      const systemPrompt = this.getSystemPrompt()
      const userPrompt = this.formatPrompt(prompt, context)

      const result = await generateObject({
        model: this.model,
        prompt: userPrompt,
        schema: schema,
        system: systemPrompt,
        ...this.getResolvedModelConfig(context?.metadata?.userTier || 'free')
      })

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: result.object,
        metadata: {
          tokensUsed: result.usage?.totalTokens,
          processingTime,
          confidence: this.calculateConfidence(result.object)
        }
      }
    } catch (error) {
      console.error(`Agent ${this.agentType} error:`, error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          processingTime: Date.now() - startTime
        }
      }
    }
  }

  protected async generateTextResponse(
    prompt: string,
    context: AgentContext
  ): Promise<AgentResult<string>> {
    const startTime = Date.now()
    
    try {
      const systemPrompt = this.getSystemPrompt()
      const userPrompt = this.formatPrompt(prompt, context)

      const result = await generateText({
        model: this.model,
        prompt: userPrompt,
        system: systemPrompt,
        ...this.getResolvedModelConfig(context?.metadata?.userTier || 'free')
      })

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: result.text,
        metadata: {
          tokensUsed: result.usage?.totalTokens,
          processingTime
        }
      }
    } catch (error) {
      console.error(`Agent ${this.agentType} error:`, error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          processingTime: Date.now() - startTime
        }
      }
    }
  }

  protected getSystemPrompt(): string {
    return `You are the ${this.capabilities.name}, an expert AI agent specializing in ${this.capabilities.description.toLowerCase()}.

Your expertise includes: ${this.capabilities.expertise.join(', ')}.
Available tools: ${this.capabilities.tools.join(', ')}.

Guidelines:
- Provide actionable, data-driven insights
- Be specific and detailed in your analysis
- Consider conversion optimization in all recommendations
- Use industry best practices and current trends
- Provide confidence scores for your recommendations
- Include sources and reasoning for your conclusions

Always respond with well-structured, professional analysis that helps users make informed decisions about their marketing funnels.`
  }

  protected formatPrompt(prompt: string, context: AgentContext): string {
    return `${prompt}

Context:
- User ID: ${context.userId}
- Project ID: ${context.projectId || 'N/A'}
- Session ID: ${context.sessionId}
${context.metadata ? `- Additional Context: ${JSON.stringify(context.metadata)}` : ''}

Please provide a comprehensive analysis based on your expertise in ${this.agentType}.`
  }

  protected getModelConfig() {
    const baseConfig = AI_CONFIG.models[this.agentType] || {}
    return {
      temperature: baseConfig.temperature || AI_CONFIG.temperature,
      maxTokens: baseConfig.maxTokens || AI_CONFIG.maxTokens,
      topP: AI_CONFIG.topP
    }
  }

  protected calculateConfidence(result: any): number {
    // Basic confidence calculation - can be enhanced per agent
    if (!result) return 0
    
    // Check for completeness of data
    const keys = Object.keys(result)
    const filledKeys = keys.filter(key => {
      const value = result[key]
      return value !== null && value !== undefined && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true)
    })
    
    return Math.round((filledKeys.length / keys.length) * 100) / 100
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = AI_CONFIG.maxRetries
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (attempt === maxRetries) break
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }
}