import { useMemo, useState } from 'react'
import type { Order } from '../../api/client'

export type SortKey = 'orderNumber' | 'weightKg' | 'pickupDate'
export type SortDirection = 'asc' | 'desc'

export interface OrderListSummary {
  count: number
  totalWeightKg: number
  nextPickupDate: string | null
}

export interface OrderListView {
  query: string
  setQuery: (value: string) => void
  sort: { key: SortKey; direction: SortDirection } | null
  toggleSort: (key: SortKey) => void
  rows: Order[]
  summary: OrderListSummary
}

function localToday(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function matches(order: Order, needle: string): boolean {
  return [
    order.orderNumber,
    order.senderCity,
    order.senderAddress,
    order.receiverCity,
    order.receiverAddress,
  ].some((field) => field.toLowerCase().includes(needle))
}

function compare(a: Order, b: Order, key: SortKey): number {
  if (key === 'weightKg') return a.weightKg - b.weightKg
  return a[key].localeCompare(b[key])
}

export function useOrderListView(orders: Order[], today: string = localToday()): OrderListView {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null)

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
  }

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle ? orders.filter((order) => matches(order, needle)) : orders
    if (!sort) return filtered
    const sorted = [...filtered].sort((a, b) => compare(a, b, sort.key))
    return sort.direction === 'asc' ? sorted : sorted.reverse()
  }, [orders, query, sort])

  const summary = useMemo<OrderListSummary>(() => {
    const upcoming = rows
      .map((order) => order.pickupDate)
      .filter((date) => date >= today)
      .sort()

    return {
      count: rows.length,
      totalWeightKg: rows.reduce((total, order) => total + order.weightKg, 0),
      nextPickupDate: upcoming[0] ?? null,
    }
  }, [rows, today])

  return { query, setQuery, sort, toggleSort, rows, summary }
}
