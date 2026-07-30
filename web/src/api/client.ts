import createClient from 'openapi-fetch'
import i18n from '../i18n'
import type { components, paths } from './schema'

/**
 * In production nginx serves the app and proxies /api to the API, so a relative
 * base URL is correct. VITE_API_BASE_URL exists for pointing at another host.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/'

export const api = createClient<paths>({ baseUrl })

// The API localizes validation messages from Accept-Language, so every request
// carries the active language rather than each call site plumbing it.
api.use({
  onRequest({ request }) {
    request.headers.set('Accept-Language', i18n.language)
    return request
  },
})

export type Order = components['schemas']['OrderResponse']
export type CreateOrderPayload = components['schemas']['CreateOrderRequest']
