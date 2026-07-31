import { useTranslation } from 'react-i18next'
import { StatTile, TileRow } from '../../components/StatTile'
import { useFormatters } from '../../i18n/useFormatters'
import type { OrderListSummary } from './useOrderListView'

export function OrdersSummary({ summary }: { summary: OrderListSummary }) {
  const { t } = useTranslation()
  const { formatDate, formatWeight } = useFormatters()

  return (
    <TileRow>
      <StatTile label={t('orders.list.summaryCount')} value={String(summary.count)} />
      <StatTile
        label={t('orders.list.summaryWeight')}
        value={formatWeight(summary.totalWeightKg)}
      />
      <StatTile
        label={t('orders.list.summaryNextPickup')}
        value={
          summary.nextPickupDate ? formatDate(summary.nextPickupDate) : t('orders.list.noPickup')
        }
      />
    </TileRow>
  )
}
