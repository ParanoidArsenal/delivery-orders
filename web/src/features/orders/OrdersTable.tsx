import { useTranslation } from 'react-i18next'
import type { Order } from '../../api/client'
import { OrderRow } from './OrderRow'

export function OrdersTable({
  orders,
  onOpen,
}: {
  orders: Order[]
  onOpen: (id: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="orders-table w-full text-left text-sm">
          <caption className="sr-only">{t('orders.table.caption')}</caption>
          <thead className="bg-background-secondary">
            <tr className="text-[11px] uppercase tracking-wider text-muted">
              <th scope="col" className="px-4 py-2.5 font-medium">
                {t('orders.table.orderNumber')}
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                {t('orders.table.route')}
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                {t('orders.table.weight')}
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                {t('orders.table.pickup')}
              </th>
              <th scope="col" className="pr-4">
                <span className="sr-only">{t('orders.table.openOrder', { orderNumber: '' })}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onOpen={onOpen} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">{t('orders.count', { count: orders.length })}</p>
    </div>
  )
}
