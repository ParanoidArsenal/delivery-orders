export type FieldErrors = Record<string, string[]>

interface ProblemDetails {
  title?: string
  detail?: string
  errors?: FieldErrors
}

/**
 * Turns an RFC 9457 problem body into a headline message plus per-field errors.
 *
 * The headline is whatever the server sent — the API localizes it from
 * `Accept-Language`, so it already matches the UI language. When the body carries no
 * usable text the message is left empty and the component substitutes its own
 * translated fallback (`common.error`); no English copy is hard-coded here.
 */
export function extractProblem(body: unknown): { message: string; fieldErrors: FieldErrors } {
  const problem = (body ?? {}) as ProblemDetails
  const fieldErrors = problem.errors ?? {}
  const message = problem.detail ?? problem.title ?? ''

  return { message, fieldErrors }
}
