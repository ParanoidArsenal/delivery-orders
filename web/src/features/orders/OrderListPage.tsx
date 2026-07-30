import { Button } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useOrders } from '../../api/orders'
import { EmptyState, ErrorView, Loading } from '../../components/StateViews'

export function OrderListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: orders, isPending, isError, error, refetch } = useOrders()

  if (isPending) return <Loading label={t('orders.list.loading')} />
  if (isError) return <ErrorView message={(error as Error).message} onRetry={() => void refetch()} />

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        title={t('orders.list.emptyTitle')}
        description={t('orders.list.emptyDescription')}
        action={
          <Button variant="primary" onClick={() => void navigate('/orders/new')}>
            {t('orders.list.createFirst')}
          </Button>
        }
      />
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('orders.list.title')}</h1>
        <Button variant="primary" onClick={() => void navigate('/orders/new')}>
          {t('nav.newOrder')}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{t('orders.table.caption')}</caption>
          <thead className="bg-background-secondary">
            <tr>
              <th scope="col" className="px-4 py-3">
                {t('orders.table.orderNumber')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('orders.fields.senderCity')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('orders.fields.receiverCity')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('orders.fields.weight')}
              </th>
              <th scope="col" className="px-4 py-3">
                {t('orders.fields.pickupDate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                tabIndex={0}
                role="link"
                aria-label={t('orders.table.openOrder', { orderNumber: order.orderNumber })}
                onClick={() => void navigate(`/orders/${order.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void navigate(`/orders/${order.id}`)
                  }
                }}
                className="cursor-pointer border-t border-border hover:bg-background-secondary focus:bg-background-secondary"
              >
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <div>{order.senderCity}</div>
                  <div className="text-muted">{order.senderAddress}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{order.receiverCity}</div>
                  <div className="text-muted">{order.receiverAddress}</div>
                </td>
                <td className="px-4 py-3">{order.weightKg}</td>
                <td className="px-4 py-3">{order.pickupDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
