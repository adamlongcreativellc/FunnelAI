import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AIOrchestrator, type WorkflowProgress } from '@/lib/ai/orchestrator'
import { prisma } from '@/lib/prisma'

const generateFunnelSchema = z.object({
  projectId: z.string(),
  businessName: z.string().min(1),
  businessDescription: z.string().min(10),
  industry: z.string().min(1),
  targetAudience: z.string().min(10),
  businessGoals: z.array(z.string()).min(1),
  monthlyRevenue: z.string().optional(),
  competitorUrls: z.array(z.string().url()).optional(),
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

export async function POST(request: NextRequest) {
  try {
    // TODO: Get user from session/auth
    const userId = 'demo-user-id' // Replace with actual auth
    
    const body = await request.json()
    const validatedData = generateFunnelSchema.parse(body)

    // Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { 
        id: validatedData.projectId,
        userId: userId
      }
    })

    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404 }
      )
    }

    // Create readable stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        
        const sendMessage = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        // Progress callback for orchestrator
        const onProgress = (progress: WorkflowProgress) => {
          sendMessage({
            type: 'progress',
            data: progress
          })
        }

        // Initialize AI orchestrator
        const orchestrator = new AIOrchestrator()

        // Create agent context
        const context = {
          userId,
          projectId: validatedData.projectId,
          sessionId: `session-${Date.now()}`,
          metadata: {
            requestId: request.headers.get('x-request-id'),
            userAgent: request.headers.get('user-agent')
          }
        }

        // Start funnel generation
        orchestrator.createFunnel(validatedData, context, onProgress)
          .then(async (result) => {
            if (result.success) {
              // Update project with generated data
              const updatedProject = await prisma.project.update({
                where: { id: validatedData.projectId },
                data: {
                  status: 'completed',
                  marketResearch: result.data.marketResearch,
                  personas: result.data.personas,
                  contentVariations: result.data.contentVariations,
                  funnelStrategy: result.data.funnelStrategy,
                  estimatedConversionRate: result.data.estimatedConversionRate,
                  updatedAt: new Date()
                }
              })

              sendMessage({
                type: 'complete',
                data: {
                  project: updatedProject,
                  aiResult: result.data,
                  metadata: result.metadata
                }
              })
            } else {
              sendMessage({
                type: 'error',
                data: { message: result.error }
              })
            }
            
            controller.close()
          })
          .catch((error) => {
            console.error('Stream generation error:', error)
            sendMessage({
              type: 'error',
              data: { message: error.message || 'Generation failed' }
            })
            controller.close()
          })
      },

      cancel() {
        console.log('Stream cancelled by client')
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Stream setup error:', error)
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          details: error.errors 
        }),
        { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}