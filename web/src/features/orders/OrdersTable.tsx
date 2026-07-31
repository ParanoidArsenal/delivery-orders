import { useTranslation } from 'react-i18next'
import type { Order } from '../../api/client'
import { OrderRow } from './OrderRow'
import type { OrderListView, SortKey } from './useOrderListView'

interface Props {
  orders: Order[]
  onOpen: (id: string) => void
  sort: OrderListView['sort']
  onSort: (key: SortKey) => void
  query: string
  onClearQuery: () => void
}

const HEAD_CLASS = 'px-4 py-2.5 font-medium'

export function OrdersTable({ orders, onOpen, sort, onSort, query, onClearQuery }: Props) {
  const { t } = useTranslation()

  const ariaSort = (key: SortKey) => {
    if (sort?.key !== key) return 'none' as const
    return sort.direction === 'asc' ? ('ascending' as const) : ('descending' as const)
  }

  const caret = (key: SortKey) => (sort?.key === key ? (sort.direction === 'asc' ? '↑' : '↓') : '')

  const SortableHeader = ({
    columnKey,
    label,
    align,
  }: {
    columnKey: SortKey
    label: string
    align?: 'right'
  }) => (
    <th
      scope="col"
      aria-sort={ariaSort(columnKey)}
      className={`${HEAD_CLASS} ${align === 'right' ? 'text-right' : ''}`}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        aria-label={t('orders.table.sortBy', { column: label })}
        className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus"
      >
        {label}
        <span aria-hidden="true">{caret(columnKey)}</span>
      </button>
    </th>
  )

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border px-4 py-12 text-center">
        <p className="text-muted">{t('orders.list.noMatches', { query })}</p>
        <button type="button" onClick={onClearQuery} className="mt-2 text-link underline">
          {t('orders.list.clearSearch')}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="orders-table w-full text-left text-sm">
          <caption className="sr-only">{t('orders.table.caption')}</caption>
          <thead className="bg-background-secondary">
            <tr className="text-[11px] uppercase tracking-wider text-muted">
              <SortableHeader columnKey="orderNumber" label={t('orders.table.orderNumber')} />
              <th scope="col" className={HEAD_CLASS}>
                {t('orders.table.route')}
              </th>
              <SortableHeader columnKey="weightKg" label={t('orders.table.weight')} align="right" />
              <SortableHeader columnKey="pickupDate" label={t('orders.table.pickup')} />
              <th scope="col" className="pr-4">
                <span className="sr-only">{t('orders.table.actions')}</span>
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
