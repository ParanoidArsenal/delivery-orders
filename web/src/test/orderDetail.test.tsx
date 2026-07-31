import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api/client'
import { OrderDetailPage } from '../features/orders/OrderDetailPage'

const ORDER = {
  id: 'c0ffee00-0000-4000-8000-000000000000',
  orderNumber: 'ORD-20260731-0001',
  senderCity: 'Saint Petersburg',
  senderAddress: 'Nevsky Prospekt 28',
  receiverCity: 'Moscow',
  receiverAddress: 'Tverskaya 12',
  weightKg: 1250.5,
  pickupDate: '2026-08-15',
  createdAt: '2026-07-31T12:16:00+00:00',
}

function renderDetail() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/orders/${ORDER.id}`]}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.spyOn(api, 'GET').mockResolvedValue({
      data: ORDER,
      error: undefined,
      response: new Response(),
    } as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the route, both addresses and the key facts', async () => {
    renderDetail()

    expect(
      await screen.findByRole('heading', { level: 1, name: 'ORD-20260731-0001' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Saint Petersburg')).toBeInTheDocument()
    expect(screen.getByText('Nevsky Prospekt 28')).toBeInTheDocument()
    expect(screen.getByText('Moscow')).toBeInTheDocument()
    expect(screen.getByText('Tverskaya 12')).toBeInTheDocument()
    expect(screen.getByText('1,250.5 kg')).toBeInTheDocument()
    expect(screen.getByText('Aug 15, 2026')).toBeInTheDocument()
  })

  it('labels the origin and destination', async () => {
    renderDetail()
    await screen.findByRole('heading', { level: 1, name: 'ORD-20260731-0001' })

    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('To')).toBeInTheDocument()
  })

  it('is read-only', async () => {
    renderDetail()
    await screen.findByRole('heading', { level: 1, name: 'ORD-20260731-0001' })

    expect(document.querySelectorAll('input, textarea, select')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('offers a breadcrumb back to the list', async () => {
    renderDetail()
    await waitFor(() => expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument())

    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/')
  })

  it('states plainly that distance is not tracked', async () => {
    renderDetail()
    await screen.findByRole('heading', { level: 1, name: 'ORD-20260731-0001' })

    expect(screen.getByText('Distance')).toBeInTheDocument()
    expect(screen.getByText('Not tracked')).toBeInTheDocument()
  })
})
