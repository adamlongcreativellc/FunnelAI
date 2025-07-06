export class TypedError extends Error {
  constructor(
    message: string,
    public code?: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'TypedError'
  }
}

export function handleUnknownError(error: unknown, context: string): TypedError {
  if (error instanceof Error) {
    return new TypedError(`${context}: ${error.message}`, 'KNOWN_ERROR', error)
  }
  
  if (typeof error === 'string') {
    return new TypedError(`${context}: ${error}`, 'STRING_ERROR', error)
  }
  
  return new TypedError(
    `${context}: Unknown error occurred`,
    'UNKNOWN_ERROR',
    error
  )
}

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  return typeof error === 'string' ? error : 'Unknown error occurred'
}

export function getErrorName(error: unknown): string {
  if (isError(error)) {
    return error.name
  }
  return 'UnknownError'
}

// Type-safe config resolution for AI models
interface TierConfig<T> {
  free: T
  premium: T
  enterprise: T
}

export type ConfigValue<T> = T | TierConfig<T>

export function resolveConfigValue<T>(
  value: ConfigValue<T>, 
  userTier: keyof TierConfig<T> = 'free'
): T {
  if (typeof value === 'object' && value !== null && 'free' in value) {
    return (value as TierConfig<T>)[userTier]
  }
  return value as T
}