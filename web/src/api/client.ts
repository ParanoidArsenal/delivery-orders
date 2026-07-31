import createClient from 'openapi-fetch'
import i18n from '../i18n'
import type { components, paths } from './schema'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/'

export const api = createClient<paths>({ baseUrl })

api.use({
  onRequest({ request }) {
    request.headers.set('Accept-Language', i18n.language)
    return request
  },
})

export type Order = components['schemas']['OrderResponse']
export type CreateOrderPayload = components['schemas']['CreateOrderRequest']
