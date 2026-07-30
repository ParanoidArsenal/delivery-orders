import type { ReactNode } from 'react'

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="py-16 text-center text-muted">
      {label}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="py-16 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="mt-1 text-muted">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg bg-danger-soft p-4 text-danger">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="mt-2 underline" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
