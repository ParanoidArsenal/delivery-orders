import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Order } from '../../api/client'
import i18n from '../../i18n'
import { OrdersTable } from './OrdersTable'

type TableProps = ComponentProps<typeof OrdersTable>

const orders: Order[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    orderNumber: 'ORD-20260815-0001',
    senderCity: 'Moscow',
    senderAddress: 'Tverskaya 1',
    receiverCity: 'Kazan',
    receiverAddress: 'Bauman 5',
    weightKg: 1250.5,
    pickupDate: '2026-08-15',
    createdAt: '2026-07-30T10:15:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    orderNumber: 'ORD-20260816-0002',
    senderCity: 'Sochi',
    senderAddress: 'Navaginskaya 9',
    receiverCity: 'Omsk',
    receiverAddress: 'Lenina 3',
    weightKg: 12,
    pickupDate: '2026-08-16',
    createdAt: '2026-07-30T11:00:00Z',
  },
]

function props(overrides: Partial<TableProps> = {}): TableProps {
  return {
    orders,
    onOpen: vi.fn(),
    sort: null,
    onSort: vi.fn(),
    query: '',
    onClearQuery: vi.fn(),
    ...overrides,
  }
}

describe('OrdersTable', () => {
  it('renders the translated column headers and caption', () => {
    render(<OrdersTable {...props()} />)

    expect(screen.getByRole('columnheader', { name: 'Order number' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Route' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Weight' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Pickup' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'All delivery orders, newest first' })).toBeVisible()
  })

  it('exposes every row as a link with an accessible label', () => {
    render(<OrdersTable {...props()} />)

    const row = screen.getByRole('link', { name: 'Open order ORD-20260815-0001' })
    expect(row).toHaveAttribute('tabindex', '0')
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('opens the order on click, Enter and Space', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<OrdersTable {...props({ onOpen })} />)

    const row = screen.getByRole('link', { name: 'Open order ORD-20260816-0002' })

    await user.click(row)
    expect(onOpen).toHaveBeenLastCalledWith('22222222-2222-4222-8222-222222222222')

    row.focus()
    await user.keyboard('{Enter}')
    expect(onOpen).toHaveBeenLastCalledWith('22222222-2222-4222-8222-222222222222')

    await user.keyboard('[Space]')
    expect(onOpen).toHaveBeenCalledTimes(3)
  })

  it('formats the weight and pickup date for the active locale', async () => {
    const { rerender } = render(<OrdersTable {...props()} />)

    const row = screen.getByRole('link', { name: /ORD-20260815-0001/ })
    expect(within(row).getByText('1,250.5 kg')).toBeInTheDocument()
    expect(within(row).getByText('Aug 15, 2026')).toBeInTheDocument()
    expect(within(row).getByText('Moscow')).toBeInTheDocument()
    expect(within(row).getByText('Kazan')).toBeInTheDocument()

    await i18n.changeLanguage('ru')
    rerender(<OrdersTable {...props()} />)

    const ruRow = screen.getByRole('link', { name: /ORD-20260815-0001/ })
    expect(within(ruRow).getByText('1 250,5 кг')).toBeInTheDocument()
    expect(within(ruRow).getByText('15 авг. 2026 г.')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Номер заказа' })).toBeInTheDocument()
  })

  it('shows the pluralised order count', async () => {
    const { rerender } = render(<OrdersTable {...props()} />)
    expect(screen.getByText('2 orders')).toBeInTheDocument()

    rerender(<OrdersTable {...props({ orders: [orders[0]] })} />)
    expect(screen.getByText('1 order')).toBeInTheDocument()

    await i18n.changeLanguage('ru')
    rerender(<OrdersTable {...props()} />)
    expect(screen.getByText('2 заказа')).toBeInTheDocument()
  })

  it('labels every data cell for the mobile card layout', () => {
    render(<OrdersTable {...props({ orders: [orders[0]] })} />)

    const cells = screen.getAllByRole('cell')
    const labelled = cells.filter((cell) => cell.hasAttribute('data-label'))

    expect(labelled.map((cell) => cell.getAttribute('data-label'))).toEqual([
      'Order number',
      'Route',
      'Weight',
      'Pickup',
    ])
    expect(cells).toHaveLength(labelled.length + 1)
  })
  it('marks sortable headers with aria-sort and toggles on click', async () => {
    const onSort = vi.fn()
    const user = userEvent.setup()
    render(<OrdersTable {...props({ onSort, sort: { key: 'weightKg', direction: 'asc' } })} />)

    expect(screen.getByRole('columnheader', { name: /weight/i })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )

    await user.click(screen.getByRole('button', { name: /sort by weight/i }))
    expect(onSort).toHaveBeenCalledWith('weightKg')
  })

  it('does not offer sorting on the route column', () => {
    render(<OrdersTable {...props()} />)

    const routeHeader = screen.getByRole('columnheader', { name: /route/i })
    expect(routeHeader.querySelector('button')).toBeNull()
  })

  it('shows a no-matches state naming the query, with a clear action', async () => {
    const onClearQuery = vi.fn()
    const user = userEvent.setup()
    render(<OrdersTable {...props({ orders: [], query: 'zzz', onClearQuery })} />)

    expect(screen.getByText(/no orders match/i)).toBeInTheDocument()
    expect(screen.getByText(/zzz/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear search/i }))
    expect(onClearQuery).toHaveBeenCalled()
  })
})
