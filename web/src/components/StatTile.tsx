import type { ReactNode } from 'react'

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
      {children}
    </span>
  )
}

export function StatTile({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-background px-4 py-3">
      <Eyebrow>{label}</Eyebrow>
      <span className={muted ? 'text-muted' : 'text-lg font-semibold tabular-nums'}>{value}</span>
    </div>
  )
}

export function TileRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
      {children}
    </div>
  )
}
