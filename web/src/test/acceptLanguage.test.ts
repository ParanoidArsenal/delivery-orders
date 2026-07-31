import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The API localizes its validation messages from Accept-Language. Without this header
 * every server-side message silently reverts to English while the UI is Russian, and
 * nothing else in the suite would notice.
 *
 * The client is imported dynamically with an absolute base URL stubbed in: the real
 * default is the relative `/`, which Node's URL parser cannot resolve outside a browser.
 * The middleware under test is the production one in `api/client.ts`.
 */
describe('Accept-Language propagation', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  async function load() {
    // A fresh Response per call: a single shared one has its body consumed by the
    // first request and the second then throws "Body has already been read".
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }),
      ),
    )
    const { api } = await import('../api/client')
    const i18n = (await import('../i18n')).default
    return { api, i18n, fetchSpy }
  }

  it('sends the active language on every request', async () => {
    const { api, i18n, fetchSpy } = await load()

    await i18n.changeLanguage('ru')
    await api.GET('/api/orders')

    const request = fetchSpy.mock.calls[0][0] as Request
    expect(request.headers.get('Accept-Language')).toBe('ru')
  })

  it('follows a language change', async () => {
    const { api, i18n, fetchSpy } = await load()

    await i18n.changeLanguage('en')
    await api.GET('/api/orders')
    expect((fetchSpy.mock.calls[0][0] as Request).headers.get('Accept-Language')).toBe('en')

    await i18n.changeLanguage('ru')
    await api.GET('/api/orders')
    expect((fetchSpy.mock.calls[1][0] as Request).headers.get('Accept-Language')).toBe('ru')
  })
})
