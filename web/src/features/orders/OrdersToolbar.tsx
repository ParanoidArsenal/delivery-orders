import { Input } from '@heroui/react'
import { useTranslation } from 'react-i18next'

export function OrdersToolbar({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (value: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div>
      <label htmlFor="orders-search" className="sr-only">
        {t('orders.list.searchLabel')}
      </label>
      <Input
        id="orders-search"
        type="search"
        value={query}
        placeholder={t('orders.list.searchPlaceholder')}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </div>
  )
}
