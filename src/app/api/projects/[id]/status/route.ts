import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params
    const projectId = params.id

    // Get project status
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        aiJobs: {
          select: {
            id: true,
            progress: true,
            status: true,
            jobType: true,
            errorMessage: true,
            processingTimeSeconds: true,
            createdAt: true,
            startedAt: true,
            completedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    const latestJob = project.aiJobs[0]
    
    // Determine current phase based on progress
    let currentPhase = 'Draft'
    if (latestJob?.progress) {
      if (latestJob.progress < 25) {
        currentPhase = 'Research Starting...'
      } else if (latestJob.progress < 50) {
        currentPhase = 'Market Research'
      } else if (latestJob.progress < 75) {
        currentPhase = 'Generating Personas'
      } else if (latestJob.progress < 100) {
        currentPhase = 'Creating Content'
      } else {
        currentPhase = 'Complete'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status: project.status,
        progress: latestJob?.progress || 0,
        currentPhase: latestJob?.jobType || currentPhase,
        processingTime: latestJob?.processingTimeSeconds,
        error: latestJob?.errorMessage
      }
    })

  } catch (error) {
    console.error('GET /api/projects/[id]/status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { status } = await request.json()
    
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}