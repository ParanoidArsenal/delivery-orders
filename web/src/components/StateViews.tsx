import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/** The label is always supplied by the caller so the copy stays in the locale files. */
export function Loading({ label }: { label: string }) {
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
  const { t } = useTranslation()

  return (
    // danger-soft-foreground is the token HeroUI defines for text on the soft danger
    // surface; plain text-danger only reaches 2.68:1 on it in light mode.
    <div role="alert" className="rounded-lg bg-danger-soft p-4 text-danger-soft-foreground">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="mt-2 underline" onClick={onRetry}>
          {t('common.retry')}
        </button>
      ) : null}
    </div>
  )
}
