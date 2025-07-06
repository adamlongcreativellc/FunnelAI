import { Decimal } from '@prisma/client/runtime/library';

/**
 * Transform Prisma Decimal values to JavaScript numbers
 * Handles various input types safely
 */
export function transformDecimalToNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (value instanceof Decimal) return value.toNumber();
  return 0;
}

/**
 * Transform a single project object's decimal fields to numbers
 */
export function transformProjectForAPI(project: any) {
  if (!project) return null;
  
  return {
    ...project,
    revenueGenerated: transformDecimalToNumber(project.revenueGenerated),
    estimatedConversionRate: project.estimatedConversionRate 
      ? transformDecimalToNumber(project.estimatedConversionRate) 
      : null,
    actualConversionRate: project.actualConversionRate 
      ? transformDecimalToNumber(project.actualConversionRate) 
      : null,
    // Add other decimal fields as needed in the future
    // budget: transformDecimalToNumber(project.budget),
    // cost: transformDecimalToNumber(project.cost),
  };
}

/**
 * Transform an array of projects
 */
export function transformProjectsForAPI(projects: any[]) {
  if (!projects || !Array.isArray(projects)) return [];
  return projects.map(transformProjectForAPI);
}

/**
 * Transform paginated project response
 */
export function transformPaginatedProjectsForAPI(response: {
  projects: any[];
  pagination?: any;
}) {
  return {
    ...response,
    projects: transformProjectsForAPI(response.projects),
  };
}