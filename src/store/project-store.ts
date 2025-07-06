import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Project, Persona, MarketResearch, Content } from '@/types/api'

interface ProjectStore {
  // State
  currentProject: Project | null
  projects: Project[]
  isGenerating: boolean
  generationProgress: number
  
  // Actions
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  setIsGenerating: (isGenerating: boolean) => void
  setGenerationProgress: (progress: number) => void
  
  // Real-time collaboration
  collaborators: string[]
  addCollaborator: (userId: string) => void
  removeCollaborator: (userId: string) => void
}

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentProject: null,
    projects: [],
    isGenerating: false,
    generationProgress: 0,
    collaborators: [],
    
    // Actions
    setCurrentProject: (project) => set({ currentProject: project }),
    
    setProjects: (projects) => set({ projects }),
    
    addProject: (project) => set((state) => ({
      projects: [project, ...state.projects]
    })),
    
    updateProject: (id, updates) => set((state) => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject: state.currentProject?.id === id 
        ? { ...state.currentProject, ...updates }
        : state.currentProject
    })),
    
    removeProject: (id) => set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject
    })),
    
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    
    setGenerationProgress: (progress) => set({ generationProgress: progress }),
    
    // Collaboration
    addCollaborator: (userId) => set((state) => ({
      collaborators: [...new Set([...state.collaborators, userId])]
    })),
    
    removeCollaborator: (userId) => set((state) => ({
      collaborators: state.collaborators.filter(id => id !== userId)
    }))
  }))
)

// Selectors
export const useCurrentProject = () => useProjectStore(state => state.currentProject)
export const useProjectsFromStore = () => useProjectStore(state => state.projects)
export const useIsGenerating = () => useProjectStore(state => state.isGenerating)
export const useGenerationProgress = () => useProjectStore(state => state.generationProgress)