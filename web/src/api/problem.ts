export type FieldErrors = Record<string, string[]>

interface ProblemDetails {
  title?: string
  detail?: string
  errors?: FieldErrors
}

export function extractProblem(body: unknown): { message: string; fieldErrors: FieldErrors } {
  const problem = (body ?? {}) as ProblemDetails
  const fieldErrors = problem.errors ?? {}
  const message = problem.detail ?? problem.title ?? ''

  return { message, fieldErrors }
}
