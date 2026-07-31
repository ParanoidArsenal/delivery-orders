import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useOrder } from '../../api/orders'
import { resolveErrorMessage } from '../../api/problem'
import { Breadcrumb } from '../../components/Breadcrumb'
import { Eyebrow, StatTile, TileRow } from '../../components/StatTile'
import { ErrorView, Loading } from '../../components/StateViews'
import { useFormatters } from '../../i18n/useFormatters'
import { OrderRoute } from './OrderRoute'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const { formatDate, formatDateTime, formatWeight } = useFormatters()
  const { data: order, isPending, isError, error, refetch } = useOrder(id)

  if (isPending) return <Loading label={t('orders.detail.loading')} />
  if (isError) {
    return (
      <ErrorView
        message={resolveErrorMessage(error, t('common.error'))}
        onRetry={() => void refetch()}
      />
    )
  }
  if (!order) return <ErrorView message={t('orders.detail.notFound')} />

  return (
    <section>
      <Breadcrumb
        items={[{ label: t('nav.breadcrumbOrders'), to: '/' }, { label: order.orderNumber }]}
      />

      <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow>{t('orders.detail.orderNumber')}</Eyebrow>
            <h1 className="font-mono text-xl font-semibold">{order.orderNumber}</h1>
          </div>
          <div className="flex flex-col text-right">
            <Eyebrow>{t('orders.detail.createdLabel')}</Eyebrow>
            <span className="text-sm tabular-nums">{formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        <OrderRoute order={order} />
      </div>

      <div className="mt-4">
        <TileRow>
          <StatTile label={t('orders.fields.weight')} value={formatWeight(order.weightKg)} />
          <StatTile label={t('orders.fields.pickupDate')} value={formatDate(order.pickupDate)} />
          <StatTile
            label={t('orders.detail.distance')}
            value={t('orders.detail.distanceUnknown')}
            muted
          />
        </TileRow>
      </div>
    </section>
  )
}
