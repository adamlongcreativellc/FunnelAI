export enum ProjectStatus {
  DRAFT = 'DRAFT',
  RESEARCHING = 'RESEARCHING',
  RESEARCH_COMPLETE = 'RESEARCH_COMPLETE',
  STRATEGIZING = 'STRATEGIZING',
  STRATEGY_COMPLETE = 'STRATEGY_COMPLETE',
  PERSONAS_COMPLETE = 'PERSONAS_COMPLETE',
  CONTENT_COMPLETE = 'CONTENT_COMPLETE',
  READY_TO_LAUNCH = 'READY_TO_LAUNCH'
}

export const STATUS_LABELS = {
  [ProjectStatus.DRAFT]: 'Draft',
  [ProjectStatus.RESEARCHING]: 'Researching Market',
  [ProjectStatus.RESEARCH_COMPLETE]: 'Research Complete',
  [ProjectStatus.STRATEGIZING]: 'Creating Strategy',
  [ProjectStatus.STRATEGY_COMPLETE]: 'Strategy Complete',
  [ProjectStatus.PERSONAS_COMPLETE]: 'Personas Complete',
  [ProjectStatus.CONTENT_COMPLETE]: 'Content Complete',
  [ProjectStatus.READY_TO_LAUNCH]: 'Ready to Launch'
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  const response = await fetch(`/api/projects/${projectId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  
  if (!response.ok) {
    throw new Error('Failed to update project status')
  }
  
  return response.json()
}