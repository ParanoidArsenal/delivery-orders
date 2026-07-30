export type FieldErrors = Record<string, string[]>

interface ProblemDetails {
  title?: string
  detail?: string
  errors?: FieldErrors
}

/** Turns an RFC 9457 problem body into a headline message plus per-field errors. */
export function extractProblem(body: unknown): { message: string; fieldErrors: FieldErrors } {
  const problem = (body ?? {}) as ProblemDetails
  const fieldErrors = problem.errors ?? {}
  const message =
    problem.detail ??
    problem.title ??
    (Object.keys(fieldErrors).length > 0
      ? 'Please correct the highlighted fields.'
      : 'Something went wrong. Please try again.')

  return { message, fieldErrors }
}
