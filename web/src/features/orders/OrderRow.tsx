import { useTranslation } from 'react-i18next'
import type { Order } from '../../api/client'
import { useFormatters } from '../../i18n/useFormatters'

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="text-muted"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function OrderRow({
  order,
  onOpen,
}: {
  order: Order
  onOpen: (id: string) => void
}) {
  const { t } = useTranslation()
  const { formatDate, formatWeight } = useFormatters()

  const open = () => onOpen(order.id)

  return (
    <tr
      tabIndex={0}
      role="link"
      aria-label={t('orders.table.openOrder', { orderNumber: order.orderNumber })}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }}
      className="cursor-pointer border-t border-border transition-colors hover:bg-background-tertiary focus-visible:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
    >
      <td
        data-label={t('orders.table.orderNumber')}
        className="px-4 py-3.5 align-top font-medium tabular-nums whitespace-nowrap"
      >
        {order.orderNumber}
      </td>
      <td data-label={t('orders.table.route')} className="px-4 py-3.5 align-top">
        <div className="flex items-center gap-1.5">
          <span>{order.senderCity}</span>
          <span aria-hidden="true" className="text-muted">
            →
          </span>
          <span>{order.receiverCity}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {order.senderAddress} · {order.receiverAddress}
        </div>
      </td>
      <td
        data-label={t('orders.table.weight')}
        className="px-4 py-3.5 text-right align-top tabular-nums whitespace-nowrap max-sm:text-left"
      >
        {formatWeight(order.weightKg)}
      </td>
      <td
        data-label={t('orders.table.pickup')}
        className="px-4 py-3.5 align-top whitespace-nowrap"
      >
        {formatDate(order.pickupDate)}
      </td>
      <td className="pr-4 py-3.5 align-top">
        <Chevron />
      </td>
    </tr>
  )
}
