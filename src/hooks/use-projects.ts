import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Project, ApiResponse, PaginationParams } from '@/types/api'
import { useProjectStore } from '@/store/project-store'
import { toast } from 'sonner'

// API functions
const projectApi = {
  getProjects: async (params?: Partial<PaginationParams>): Promise<Project[]> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)
    
    const response = await fetch(`/api/projects?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    
    const data: ApiResponse<{ projects: Project[] }> = await response.json()
    return data.data?.projects || []
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await fetch(`/api/projects/${id}`)
    if (!response.ok) throw new Error('Failed to fetch project')
    
    const data: ApiResponse<{ project: Project }> = await response.json()
    if (!data.data?.project) throw new Error('Project not found')
    return data.data.project
  },

  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create project')
    }
    
    const data: ApiResponse<{ project: Project }> = await response.json()
    if (!data.data?.project) throw new Error('Invalid response')
    return data.data.project
  },

  updateProject: async ({ id, updates }: { id: string; updates: Partial<Project> }): Promise<Project> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update project')
    }
    
    const data: ApiResponse<{ project: Project }> = await response.json()
    if (!data.data?.project) throw new Error('Invalid response')
    return data.data.project
  },

  deleteProject: async (id: string): Promise<void> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete project')
    }
  }
}

// Query hooks
export function useProjects(params?: Partial<PaginationParams>) {
  const { setProjects } = useProjectStore()
  
  const query = useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update store when data changes
  if (query.data) {
    setProjects(query.data)
  }

  return query
}

export function useProject(id: string) {
  const { setCurrentProject } = useProjectStore()
  
  const query = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getProject(id),
    enabled: !!id,
  })

  // Update store when data changes
  if (query.data) {
    setCurrentProject(query.data)
  }

  return query
}

// Mutation hooks
export function useCreateProject() {
  const queryClient = useQueryClient()
  const { addProject } = useProjectStore()
  
  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      addProject(newProject)
      toast.success('Project created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project')
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  const { updateProject } = useProjectStore()
  
  return useMutation({
    mutationFn: projectApi.updateProject,
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] })
      updateProject(updatedProject.id, updatedProject)
      toast.success('Project updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project')
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  const { removeProject } = useProjectStore()
  
  return useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      removeProject(deletedId)
      toast.success('Project deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete project')
    }
  })
}

// Real-time project generation hook
export function useProjectGeneration(projectId: string) {
  const { setIsGenerating, setGenerationProgress } = useProjectStore()
  
  return useMutation({
    mutationFn: async (projectData: any) => {
      setIsGenerating(true)
      setGenerationProgress(0)
      
      // Simulate real-time progress updates
      const eventSource = new EventSource(`/api/projects/${projectId}/generate`)
      
      return new Promise((resolve, reject) => {
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          if (data.type === 'progress') {
            setGenerationProgress(data.progress)
          } else if (data.type === 'complete') {
            setIsGenerating(false)
            setGenerationProgress(100)
            eventSource.close()
            resolve(data.project)
          } else if (data.type === 'error') {
            setIsGenerating(false)
            eventSource.close()
            reject(new Error(data.message))
          }
        }
        
        eventSource.onerror = () => {
          setIsGenerating(false)
          eventSource.close()
          reject(new Error('Connection lost'))
        }
      })
    },
    onError: (error: Error) => {
      setIsGenerating(false)
      toast.error(error.message || 'Failed to generate project')
    }
  })
}