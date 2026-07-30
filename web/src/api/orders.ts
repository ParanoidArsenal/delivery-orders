import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type CreateOrderPayload, type Order } from './client'
import { extractProblem, type FieldErrors } from './problem'

export const ordersKey = ['orders'] as const

/** Error carrying per-field messages from an RFC 9457 validation problem. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: FieldErrors,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function toApiError(body: unknown): ApiError {
  const { message, fieldErrors } = extractProblem(body)
  return new ApiError(message, fieldErrors)
}

export function useOrders() {
  return useQuery({
    queryKey: ordersKey,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await api.GET('/api/orders')
      if (error) throw toApiError(error)
      return data ?? []
    },
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [...ordersKey, id],
    queryFn: async (): Promise<Order> => {
      const { data, error } = await api.GET('/api/orders/{id}', {
        params: { path: { id } },
      })
      if (error || !data) throw toApiError(error)
      return data
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload): Promise<Order> => {
      const { data, error } = await api.POST('/api/orders', { body: payload })
      if (error || !data) throw toApiError(error)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKey }),
  })
}
