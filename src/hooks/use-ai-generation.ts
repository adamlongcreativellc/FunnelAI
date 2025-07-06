import { useState, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProjectStore } from '@/store/project-store'
import { toast } from 'sonner'

export interface FunnelGenerationInput {
  projectId: string
  businessName: string
  businessDescription: string
  industry: string
  targetAudience: string
  businessGoals: string[]
  monthlyRevenue?: string
  competitorUrls?: string[]
  brandVoice?: {
    tone: string
    style: string
    vocabulary: string[]
  }
  offer: {
    name: string
    description: string
    price?: number
    features: string[]
    benefits: string[]
  }
}

export interface GenerationProgress {
  stage: string
  progress: number
  message: string
  estimatedTimeRemaining?: number
}

export interface GenerationResult {
  project: any
  aiResult: any
  metadata: any
}

export function useAIGeneration() {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const queryClient = useQueryClient()
  const { updateProject, setIsGenerating: setStoreGenerating, setGenerationProgress } = useProjectStore()

  // Standard mutation for non-streaming generation
  const generateMutation = useMutation({
    mutationFn: async (input: FunnelGenerationInput): Promise<GenerationResult> => {
      const response = await fetch('/api/ai/generate-funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Generation failed')
      }

      const data = await response.json()
      return data.data
    },
    onSuccess: (result) => {
      updateProject(result.project.id, result.project)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', result.project.id] })
      toast.success('Funnel generated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate funnel')
    }
  })

  // Streaming generation with real-time progress
  const generateWithProgress = useCallback(async (
    input: FunnelGenerationInput,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> => {
    setIsGenerating(true)
    setStoreGenerating(true)
    setProgress({ stage: 'starting', progress: 0, message: 'Initializing AI agents...' })

    return new Promise((resolve, reject) => {
      try {
        // Close any existing connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        // Create new EventSource for streaming
        const eventSource = new EventSource('/api/ai/generate-funnel/stream')
        eventSourceRef.current = eventSource

        // Send the generation request
        fetch('/api/ai/generate-funnel/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        }).catch(reject)

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            switch (data.type) {
              case 'progress':
                const progressData = data.data as GenerationProgress
                setProgress(progressData)
                setGenerationProgress(progressData.progress)
                onProgress?.(progressData)
                break

              case 'complete':
                const result = data.data as GenerationResult
                setProgress({ 
                  stage: 'complete', 
                  progress: 100, 
                  message: 'Generation complete!' 
                })
                setIsGenerating(false)
                setStoreGenerating(false)
                
                // Update store and cache
                updateProject(result.project.id, result.project)
                queryClient.invalidateQueries({ queryKey: ['projects'] })
                queryClient.invalidateQueries({ queryKey: ['project', result.project.id] })
                
                toast.success('Funnel generated successfully!')
                eventSource.close()
                resolve(result)
                break

              case 'error':
                const errorData = data.data
                setIsGenerating(false)
                setStoreGenerating(false)
                setProgress(null)
                
                toast.error(errorData.message || 'Generation failed')
                eventSource.close()
                reject(new Error(errorData.message))
                break
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError)
          }
        }

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error)
          setIsGenerating(false)
          setStoreGenerating(false)
          setProgress(null)
          
          toast.error('Connection lost. Please try again.')
          eventSource.close()
          reject(new Error('Connection lost'))
        }

      } catch (error) {
        setIsGenerating(false)
        setStoreGenerating(false)
        setProgress(null)
        reject(error)
      }
    })
  }, [updateProject, queryClient, setStoreGenerating, setGenerationProgress])

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setIsGenerating(false)
    setStoreGenerating(false)
    setProgress(null)
    
    toast.info('Generation cancelled')
  }, [setStoreGenerating])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  return {
    // State
    isGenerating,
    progress,
    
    // Methods
    generateFunnel: generateMutation.mutate,
    generateWithProgress,
    cancelGeneration,
    cleanup,
    
    // Mutation state
    isPending: generateMutation.isPending,
    error: generateMutation.error,
    data: generateMutation.data
  }
}

// Hook for AI optimization
export function useAIOptimization() {
  const queryClient = useQueryClient()
  const { updateProject } = useProjectStore()

  const optimizeMutation = useMutation({
    mutationFn: async ({
      projectId,
      optimizationType
    }: {
      projectId: string
      optimizationType: 'conversion' | 'content' | 'personas' | 'strategy'
    }) => {
      const response = await fetch(`/api/ai/optimize/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optimizationType })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Optimization failed')
      }

      return response.json()
    },
    onSuccess: (result, variables) => {
      updateProject(variables.projectId, result.data.project)
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      toast.success('Optimization completed!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Optimization failed')
    }
  })

  return {
    optimizeProject: optimizeMutation.mutate,
    isOptimizing: optimizeMutation.isPending,
    optimizationError: optimizeMutation.error,
    optimizationData: optimizeMutation.data
  }
}

// Hook for content generation
export function useContentGeneration() {
  const contentMutation = useMutation({
    mutationFn: async ({
      type,
      persona,
      offer,
      context
    }: {
      type: 'landing_page' | 'email_sequence' | 'ad_copy' | 'headlines'
      persona: any
      offer: any
      context?: any
    }) => {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, persona, offer, context })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Content generation failed')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Content generated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Content generation failed')
    }
  })

  return {
    generateContent: contentMutation.mutate,
    isGenerating: contentMutation.isPending,
    error: contentMutation.error,
    data: contentMutation.data
  }
}