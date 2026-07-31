import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Order } from '../../api/client'
import i18n from '../../i18n'
import { OrdersTable } from './OrdersTable'

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

describe('OrdersTable', () => {
  it('renders the translated column headers and caption', () => {
    render(<OrdersTable orders={orders} onOpen={vi.fn()} />)

    expect(screen.getByRole('columnheader', { name: 'Order number' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Route' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Weight' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Pickup' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'All delivery orders, newest first' })).toBeVisible()
  })

  it('exposes every row as a link with an accessible label', () => {
    render(<OrdersTable orders={orders} onOpen={vi.fn()} />)

    const row = screen.getByRole('link', { name: 'Open order ORD-20260815-0001' })
    expect(row).toHaveAttribute('tabindex', '0')
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('opens the order on click, Enter and Space', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<OrdersTable orders={orders} onOpen={onOpen} />)

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
    const { rerender } = render(<OrdersTable orders={orders} onOpen={vi.fn()} />)

    const row = screen.getByRole('link', { name: /ORD-20260815-0001/ })
    expect(within(row).getByText('1,250.5 kg')).toBeInTheDocument()
    expect(within(row).getByText('Aug 15, 2026')).toBeInTheDocument()
    expect(within(row).getByText('Moscow')).toBeInTheDocument()
    expect(within(row).getByText('Kazan')).toBeInTheDocument()

    await i18n.changeLanguage('ru')
    rerender(<OrdersTable orders={orders} onOpen={vi.fn()} />)

    const ruRow = screen.getByRole('link', { name: /ORD-20260815-0001/ })
    // Russian groups with a non-breaking space and uses a comma decimal mark; Testing
    // Library collapses the NBSP to a plain space before comparing.
    expect(within(ruRow).getByText('1 250,5 кг')).toBeInTheDocument()
    expect(within(ruRow).getByText('15 авг. 2026 г.')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Номер заказа' })).toBeInTheDocument()
  })

  it('shows the pluralised order count', async () => {
    const { rerender } = render(<OrdersTable orders={orders} onOpen={vi.fn()} />)
    expect(screen.getByText('2 orders')).toBeInTheDocument()

    rerender(<OrdersTable orders={[orders[0]]} onOpen={vi.fn()} />)
    expect(screen.getByText('1 order')).toBeInTheDocument()

    await i18n.changeLanguage('ru')
    rerender(<OrdersTable orders={orders} onOpen={vi.fn()} />)
    expect(screen.getByText('2 заказа')).toBeInTheDocument()
  })

  it('labels every data cell for the mobile card layout', () => {
    render(<OrdersTable orders={[orders[0]]} onOpen={vi.fn()} />)

    const cells = screen.getAllByRole('cell')
    const labelled = cells.filter((cell) => cell.hasAttribute('data-label'))

    expect(labelled.map((cell) => cell.getAttribute('data-label'))).toEqual([
      'Order number',
      'Route',
      'Weight',
      'Pickup',
    ])
    // Only the chevron cell carries no data of its own.
    expect(cells).toHaveLength(labelled.length + 1)
  })
})
