import { Button } from '@heroui/react'
import { useNavigate } from 'react-router'
import { useOrders } from '../../api/orders'
import { EmptyState, ErrorView, Loading } from '../../components/StateViews'

export function OrderListPage() {
  const navigate = useNavigate()
  const { data: orders, isPending, isError, error, refetch } = useOrders()

  if (isPending) return <Loading label="Loading orders…" />
  if (isError) return <ErrorView message={(error as Error).message} onRetry={() => void refetch()} />

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Create your first delivery order to see it here."
        action={
          <Button variant="primary" onClick={() => void navigate('/orders/new')}>
            Create order
          </Button>
        }
      />
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Button variant="primary" onClick={() => void navigate('/orders/new')}>
          New order
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">All delivery orders, newest first</caption>
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-4 py-3">
                Order number
              </th>
              <th scope="col" className="px-4 py-3">
                From
              </th>
              <th scope="col" className="px-4 py-3">
                To
              </th>
              <th scope="col" className="px-4 py-3">
                Weight, kg
              </th>
              <th scope="col" className="px-4 py-3">
                Pickup date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                tabIndex={0}
                role="link"
                aria-label={`Open order ${order.orderNumber}`}
                onClick={() => void navigate(`/orders/${order.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void navigate(`/orders/${order.id}`)
                  }
                }}
                className="cursor-pointer border-t border-border hover:bg-muted/50 focus:bg-muted/50"
              >
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <div>{order.senderCity}</div>
                  <div className="text-muted-foreground">{order.senderAddress}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{order.receiverCity}</div>
                  <div className="text-muted-foreground">{order.receiverAddress}</div>
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
