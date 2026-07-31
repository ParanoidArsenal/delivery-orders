import { useTranslation } from 'react-i18next'
import { useFormatters } from '../../i18n/useFormatters'
import type { OrderListSummary } from './useOrderListView'

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-background px-4 py-3">
      <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

export function OrdersSummary({ summary }: { summary: OrderListSummary }) {
  const { t } = useTranslation()
  const { formatDate, formatWeight } = useFormatters()

  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
      <Tile label={t('orders.list.summaryCount')} value={String(summary.count)} />
      <Tile label={t('orders.list.summaryWeight')} value={formatWeight(summary.totalWeightKg)} />
      <Tile
        label={t('orders.list.summaryNextPickup')}
        value={
          summary.nextPickupDate ? formatDate(summary.nextPickupDate) : t('orders.list.noPickup')
        }
      />
    </div>
  )
}
