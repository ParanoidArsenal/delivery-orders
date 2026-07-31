import { Button } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useOrders } from '../../api/orders'
import { EmptyState, ErrorView, Loading } from '../../components/StateViews'
import { OrdersSummary } from './OrdersSummary'
import { OrdersTable } from './OrdersTable'
import { OrdersToolbar } from './OrdersToolbar'
import { useOrderListView } from './useOrderListView'

export function OrderListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: orders, isPending, isError, error, refetch } = useOrders()
  const view = useOrderListView(orders ?? [])

  const open = (id: string) => void navigate(`/orders/${id}`)

  if (isPending) return <Loading label={t('orders.list.loading')} />
  if (isError) {
    return (
      <ErrorView
        message={(error as Error).message || t('common.error')}
        onRetry={() => void refetch()}
      />
    )
  }

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
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{t('orders.list.title')}</h1>
      <OrdersSummary summary={view.summary} />
      <OrdersToolbar query={view.query} onQueryChange={view.setQuery} />
      <OrdersTable
        orders={view.rows}
        onOpen={open}
        sort={view.sort}
        onSort={view.toggleSort}
        query={view.query}
        onClearQuery={() => view.setQuery('')}
      />
    </section>
  )
}
