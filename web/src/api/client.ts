import createClient from 'openapi-fetch'
import type { components, paths } from './schema'

/**
 * In production nginx serves the app and proxies /api to the API, so a relative
 * base URL is correct. VITE_API_BASE_URL exists for pointing at another host.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/'

export const api = createClient<paths>({ baseUrl })

export type Order = components['schemas']['OrderResponse']
export type CreateOrderPayload = components['schemas']['CreateOrderRequest']
