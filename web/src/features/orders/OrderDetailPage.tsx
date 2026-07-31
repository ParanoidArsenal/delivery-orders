import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useOrder } from '../../api/orders'
import { Breadcrumb } from '../../components/Breadcrumb'
import { ErrorView, Loading } from '../../components/StateViews'
import { useFormatters } from '../../i18n/useFormatters'
import { OrderRoute } from './OrderRoute'

function Fact({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 bg-background px-4 py-3">
      <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className={muted ? 'text-muted' : 'text-lg font-semibold tabular-nums'}>{value}</span>
    </div>
  )
}

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const { formatDate, formatDateTime, formatWeight } = useFormatters()
  const { data: order, isPending, isError, error, refetch } = useOrder(id)

  if (isPending) return <Loading label={t('orders.detail.loading')} />
  if (isError) {
    return (
      <ErrorView
        message={(error as Error).message || t('common.error')}
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
            <div className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
              {t('orders.detail.orderNumber')}
            </div>
            <h1 className="font-mono text-xl font-semibold">{order.orderNumber}</h1>
          </div>
          <div className="text-right">
            <div className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted">
              {t('orders.detail.createdLabel')}
            </div>
            <div className="text-sm tabular-nums">{formatDateTime(order.createdAt)}</div>
          </div>
        </div>

        <OrderRoute order={order} />
      </div>

      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <Fact label={t('orders.fields.weight')} value={formatWeight(order.weightKg)} />
        <Fact label={t('orders.fields.pickupDate')} value={formatDate(order.pickupDate)} />
        <Fact
          label={t('orders.detail.distance')}
          value={t('orders.detail.distanceUnknown')}
          muted
        />
      </div>
    </section>
  )
}
