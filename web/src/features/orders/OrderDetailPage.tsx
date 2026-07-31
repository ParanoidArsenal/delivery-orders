import { Button } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { useOrder } from '../../api/orders'
import { ErrorView, Loading } from '../../components/StateViews'
import { useFormatters } from '../../i18n/useFormatters'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-3 last:border-b-0 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="sm:col-span-2">{value}</dd>
    </div>
  )
}

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t('orders.detail.heading', { orderNumber: order.orderNumber })}
          </h1>
          <p className="text-muted">
            {t('orders.detail.created', { date: formatDateTime(order.createdAt) })}
          </p>
        </div>
        <Button variant="secondary" onClick={() => void navigate('/')}>
          {t('common.backToList')}
        </Button>
      </div>
      <dl className="rounded-lg border border-border px-4">
        <Row label={t('orders.fields.senderCity')} value={order.senderCity} />
        <Row label={t('orders.fields.senderAddress')} value={order.senderAddress} />
        <Row label={t('orders.fields.receiverCity')} value={order.receiverCity} />
        <Row label={t('orders.fields.receiverAddress')} value={order.receiverAddress} />
        <Row label={t('orders.fields.weight')} value={formatWeight(order.weightKg)} />
        <Row label={t('orders.fields.pickupDate')} value={formatDate(order.pickupDate)} />
      </dl>
    </section>
  )
}
