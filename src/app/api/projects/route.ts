import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { transformProjectsForAPI, transformProjectForAPI } from '@/lib/decimal-transform'

// Validation schemas
const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  businessName: z.string().min(1, 'Business name is required'),
  businessDescription: z.string().min(10, 'Business description must be at least 10 characters'),
  industry: z.string().min(1, 'Industry is required'),
  targetAudience: z.string().min(10, 'Target audience description must be at least 10 characters'),
  businessGoals: z.array(z.string()).min(1, 'At least one business goal is required'),
  monthlyRevenue: z.string().optional(),
  competitorUrls: z.array(z.string()).optional(), // Changed from z.string().url() to handle non-URLs
  geographic: z.object({
    scope: z.enum(['auto', 'local', 'national', 'global']).default('auto'),
    location: z.string().optional(),
    radius: z.number().min(1).max(500).default(50)
  }).optional(),
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

const GetProjectsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['draft', 'researching', 'generating', 'completed', 'archived']).optional(),
  search: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined
    }

    const { page, limit, status, search } = GetProjectsSchema.parse(queryParams)
    const skip = (page - 1) * limit

    // Build filter conditions
    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          industry: true,
          targetAudience: true,
          status: true,
          estimatedConversionRate: true,
          actualConversionRate: true,
          totalVisitors: true,
          totalConversions: true,
          revenueGenerated: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true
        }
      }),
      prisma.project.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    // Transform decimal fields to numbers before sending to frontend
    const transformedProjects = transformProjectsForAPI(projects)

    return NextResponse.json({
      success: true,
      data: {
        projects: transformedProjects,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    })

  } catch (error) {
    console.error('GET /api/projects error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateProjectSchema.parse(body)

    // Create project in database first
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.businessDescription,
        businessName: validatedData.businessName,
        businessDescription: validatedData.businessDescription,
        industry: validatedData.industry,
        targetAudience: validatedData.targetAudience,
        businessGoals: validatedData.businessGoals,
        monthlyRevenue: validatedData.monthlyRevenue,
        competitorUrls: validatedData.competitorUrls || [],
        geographicScope: validatedData.geographic?.scope || 'auto',
        geographicLocation: validatedData.geographic?.location || null,
        geographicRadius: validatedData.geographic?.radius || 50,
        status: 'researching' // Start with researching status
      }
    })

    // Start AI funnel generation in the background
    const orchestrator = new AIOrchestrator()
    
    // Don't await this - let it run in background
    orchestrator.createFunnel(
      validatedData,
      {
        userId: session.user.id,
        projectId: project.id,
        sessionId: `session-${Date.now()}`
      },
      async (progress) => {
        // Update project status based on progress
        let status = 'researching'
        if (progress.progress >= 25 && progress.progress < 50) status = 'researching'
        if (progress.progress >= 50 && progress.progress < 80) status = 'generating'
        if (progress.progress >= 80) status = 'generating'
        if (progress.progress === 100) status = 'completed'

        await prisma.project.update({
          where: { id: project.id },
          data: { 
            status,
            // Store progress in metadata if needed
          }
        }).catch(console.error)
      }
    ).then(async (result) => {
      if (result.success) {
        // Update project with AI results
        await prisma.project.update({
          where: { id: project.id },
          data: {
            status: 'completed',
            marketResearch: result.data.marketResearch,
            personas: result.data.personas,
            contentVariations: result.data.contentVariations,
            funnelStrategy: result.data.funnelStrategy,
            estimatedConversionRate: result.data.estimatedConversionRate
          }
        })
      } else {
        // Mark as failed
        await prisma.project.update({
          where: { id: project.id },
          data: { 
            status: 'draft' // Reset to draft on failure
          }
        })
      }
    }).catch(async (error) => {
      console.error('Funnel generation failed:', error)
      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'draft' }
      }).catch(console.error)
    })

    // Transform decimal fields before sending to frontend
    const transformedProject = transformProjectForAPI(project)

    return NextResponse.json({
      success: true,
      data: transformedProject,
      message: 'Project created successfully. AI funnel generation started in background.'
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/projects error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}