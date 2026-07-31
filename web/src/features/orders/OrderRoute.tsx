import { useTranslation } from 'react-i18next'
import type { Order } from '../../api/client'
import { Eyebrow } from '../../components/StatTile'

function Stop({
  kind,
  city,
  address,
  last,
}: {
  kind: string
  city: string
  address: string
  last?: boolean
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-0.5 pt-1.5">
        <span
          aria-hidden="true"
          className={`size-2.5 shrink-0 rounded-full border-2 border-accent ${last ? '' : 'bg-accent'}`}
        />
        {last ? null : <span aria-hidden="true" className="min-h-6 w-0.5 flex-1 bg-border" />}
      </div>
      <div className={last ? '' : 'pb-3'}>
        <Eyebrow>{kind}</Eyebrow>
        <div className="font-semibold">{city}</div>
        <div className="text-sm text-muted">{address}</div>
      </div>
    </>
  )
}

export function OrderRoute({ order }: { order: Order }) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-[auto_1fr] items-stretch gap-x-3">
      <Stop kind={t('orders.detail.from')} city={order.senderCity} address={order.senderAddress} />
      <Stop
        kind={t('orders.detail.to')}
        city={order.receiverCity}
        address={order.receiverAddress}
        last
      />
    </div>
  )
}
