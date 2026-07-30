import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../api/client'
import { OrderCreatePage } from './OrderCreatePage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrderCreatePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function tomorrow(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/sender city/i), 'Moscow')
  await user.type(screen.getByLabelText(/sender address/i), 'Tverskaya 1')
  await user.type(screen.getByLabelText(/receiver city/i), 'Kazan')
  await user.type(screen.getByLabelText(/receiver address/i), 'Bauman 5')
  await user.type(screen.getByLabelText(/weight/i), '12.5')
  await user.type(screen.getByLabelText(/pickup date/i), tomorrow())
}

describe('OrderCreatePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows an error for every field and sends no request when submitted empty', async () => {
    const post = vi.spyOn(api, 'POST')
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /create order/i }))

    expect(await screen.findByText(/sender city is required/i)).toBeInTheDocument()
    expect(screen.getByText(/sender address is required/i)).toBeInTheDocument()
    expect(screen.getByText(/receiver city is required/i)).toBeInTheDocument()
    expect(screen.getByText(/receiver address is required/i)).toBeInTheDocument()
    expect(screen.getByText(/weight is required/i)).toBeInTheDocument()
    expect(screen.getByText(/pickup date is required/i)).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('rejects a pickup date in the past', async () => {
    const post = vi.spyOn(api, 'POST')
    const user = userEvent.setup()
    renderPage()

    await fillValidForm(user)
    await user.clear(screen.getByLabelText(/pickup date/i))
    await user.type(screen.getByLabelText(/pickup date/i), '2000-01-01')
    await user.click(screen.getByRole('button', { name: /create order/i }))

    expect(await screen.findByText(/must not be in the past/i)).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('rejects a weight over the limit', async () => {
    const user = userEvent.setup()
    renderPage()

    await fillValidForm(user)
    await user.clear(screen.getByLabelText(/weight/i))
    await user.type(screen.getByLabelText(/weight/i), '20001')
    await user.click(screen.getByRole('button', { name: /create order/i }))

    expect(await screen.findByText(/must not exceed 20000 kg/i)).toBeInTheDocument()
  })

  it('posts the payload when the form is valid', async () => {
    const post = vi.spyOn(api, 'POST').mockResolvedValue({
      data: { id: 'c0ffee00-0000-4000-8000-000000000000', orderNumber: 'ORD-20260729-0001' },
      error: undefined,
      response: new Response(),
    } as never)
    const user = userEvent.setup()
    renderPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create order/i }))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0][1]).toMatchObject({
      body: {
        senderCity: 'Moscow',
        senderAddress: 'Tverskaya 1',
        receiverCity: 'Kazan',
        receiverAddress: 'Bauman 5',
        weightKg: 12.5,
      },
    })
  })

  it('places a server field error on the matching input', async () => {
    vi.spyOn(api, 'POST').mockResolvedValue({
      data: undefined,
      error: {
        title: 'One or more validation errors occurred.',
        errors: { senderCity: ['Sender city is not served.'] },
      },
      response: new Response(null, { status: 400 }),
    } as never)
    const user = userEvent.setup()
    renderPage()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create order/i }))

    expect(await screen.findByText(/sender city is not served/i)).toBeInTheDocument()
  })
})
