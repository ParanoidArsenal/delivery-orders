import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Order } from '../api/client'
import { useOrderListView } from '../features/orders/useOrderListView'

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: crypto.randomUUID(),
    orderNumber: 'ORD-20260731-0001',
    senderCity: 'Moscow',
    senderAddress: 'Arbat 1',
    receiverCity: 'Perm',
    receiverAddress: 'Lenina 5',
    weightKg: 10,
    pickupDate: '2026-08-01',
    createdAt: '2026-07-31T10:00:00+00:00',
    ...overrides,
  } as Order
}

const orders: Order[] = [
  order({
    orderNumber: 'ORD-20260731-0003',
    senderCity: 'Kazan',
    receiverCity: 'Sochi',
    weightKg: 0.5,
    pickupDate: '2026-09-01',
  }),
  order({
    orderNumber: 'ORD-20260731-0002',
    senderCity: 'Saint Petersburg',
    receiverCity: 'Moscow',
    senderAddress: 'Nevsky 28',
    weightKg: 1250.5,
    pickupDate: '2026-08-15',
  }),
  order({
    orderNumber: 'ORD-20260731-0001',
    senderCity: 'Moscow',
    receiverCity: 'Perm',
    weightKg: 7.25,
    pickupDate: '2026-07-20',
  }),
]

const TODAY = '2026-07-31'

describe('useOrderListView', () => {
  it('returns every row and preserves API order by default', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    expect(result.current.rows.map((o) => o.orderNumber)).toEqual([
      'ORD-20260731-0003',
      'ORD-20260731-0002',
      'ORD-20260731-0001',
    ])
    expect(result.current.sort).toBeNull()
  })

  it('filters by order number', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.setQuery('0002'))
    expect(result.current.rows).toHaveLength(1)
    expect(result.current.rows[0].orderNumber).toBe('ORD-20260731-0002')
  })

  it('filters by city, case-insensitively', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.setQuery('sochi'))
    expect(result.current.rows).toHaveLength(1)
    expect(result.current.rows[0].receiverCity).toBe('Sochi')
  })

  it('filters by address', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.setQuery('nevsky'))
    expect(result.current.rows).toHaveLength(1)
  })

  it('matches the sender city as well as the receiver city', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.setQuery('moscow'))
    expect(result.current.rows).toHaveLength(2)
  })

  it('returns no rows for an unmatched query', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.setQuery('zzz'))
    expect(result.current.rows).toEqual([])
  })

  it('ignores surrounding whitespace in the query', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.setQuery('  sochi  '))
    expect(result.current.rows).toHaveLength(1)
  })

  it('sorts by weight ascending then descending', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.toggleSort('weightKg'))
    expect(result.current.rows.map((o) => o.weightKg)).toEqual([0.5, 7.25, 1250.5])
    act(() => result.current.toggleSort('weightKg'))
    expect(result.current.rows.map((o) => o.weightKg)).toEqual([1250.5, 7.25, 0.5])
  })

  it('sorts by pickup date', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.toggleSort('pickupDate'))
    expect(result.current.rows.map((o) => o.pickupDate)).toEqual([
      '2026-07-20',
      '2026-08-15',
      '2026-09-01',
    ])
  })

  it('sorts by order number', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.toggleSort('orderNumber'))
    expect(result.current.rows[0].orderNumber).toBe('ORD-20260731-0001')
  })

  it('switching sort column starts ascending', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.toggleSort('weightKg'))
    act(() => result.current.toggleSort('weightKg'))
    act(() => result.current.toggleSort('pickupDate'))
    expect(result.current.sort).toEqual({ key: 'pickupDate', direction: 'asc' })
  })

  it('summarises count and total weight of matching rows', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    expect(result.current.summary.count).toBe(3)
    expect(result.current.summary.totalWeightKg).toBeCloseTo(1258.25, 2)
  })

  it('summary follows the search', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    act(() => result.current.setQuery('sochi'))
    expect(result.current.summary.count).toBe(1)
    expect(result.current.summary.totalWeightKg).toBeCloseTo(0.5, 2)
  })

  it('next pickup is the earliest date that is not in the past', () => {
    const { result } = renderHook(() => useOrderListView(orders, TODAY))
    expect(result.current.summary.nextPickupDate).toBe('2026-08-15')
  })

  it('next pickup is null when every pickup date has passed', () => {
    const past = [order({ pickupDate: '2026-01-01' })]
    const { result } = renderHook(() => useOrderListView(past, TODAY))
    expect(result.current.summary.nextPickupDate).toBeNull()
  })

  it('treats today as a valid next pickup', () => {
    const todayOrder = [order({ pickupDate: TODAY })]
    const { result } = renderHook(() => useOrderListView(todayOrder, TODAY))
    expect(result.current.summary.nextPickupDate).toBe(TODAY)
  })

  it('summarises an empty list without throwing', () => {
    const { result } = renderHook(() => useOrderListView([], TODAY))
    expect(result.current.summary).toEqual({ count: 0, totalWeightKg: 0, nextPickupDate: null })
  })
})
