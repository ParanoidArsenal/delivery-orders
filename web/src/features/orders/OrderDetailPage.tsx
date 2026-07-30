import { Button } from '@heroui/react'
import { useNavigate, useParams } from 'react-router'
import { useOrder } from '../../api/orders'
import { ErrorView, Loading } from '../../components/StateViews'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="sm:col-span-2">{value}</dd>
    </div>
  )
}

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: order, isPending, isError, error, refetch } = useOrder(id)

  if (isPending) return <Loading label="Loading order…" />
  if (isError) return <ErrorView message={(error as Error).message} onRetry={() => void refetch()} />
  if (!order) return <ErrorView message="Order not found." />

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>
          <p className="text-muted">
            Created {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Button variant="secondary" onClick={() => void navigate('/')}>
          Back to list
        </Button>
      </div>
      <dl className="rounded-lg border border-border px-4 py-2">
        <Row label="Sender city" value={order.senderCity} />
        <Row label="Sender address" value={order.senderAddress} />
        <Row label="Receiver city" value={order.receiverCity} />
        <Row label="Receiver address" value={order.receiverAddress} />
        <Row label="Weight, kg" value={String(order.weightKg)} />
        <Row label="Pickup date" value={order.pickupDate} />
      </dl>
    </section>
  )
}
