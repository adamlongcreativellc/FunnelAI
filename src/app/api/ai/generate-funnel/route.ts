import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types/api'

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
      const response: ApiResponse = {
        success: false,
        error: 'Project not found or access denied'
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Update project status to generating
    await prisma.project.update({
      where: { id: validatedData.projectId },
      data: { status: 'generating' }
    })

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

    // Generate funnel using AI orchestrator
    const result = await orchestrator.createFunnel(validatedData, context)

    if (!result.success) {
      // Update project status to failed
      await prisma.project.update({
        where: { id: validatedData.projectId },
        data: { status: 'draft' }
      })

      const response: ApiResponse = {
        success: false,
        error: result.error || 'Funnel generation failed'
      }
      return NextResponse.json(response, { status: 500 })
    }

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

    const response: ApiResponse = {
      success: true,
      data: {
        project: updatedProject,
        aiResult: result.data,
        metadata: result.metadata
      },
      message: 'Funnel generated successfully!'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Generate funnel error:', error)
    
    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation error',
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }
      return NextResponse.json(response, { status: 400 })
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}