import { describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'

/**
 * Lives in its own file: it re-executes the i18n module to observe what happens on a
 * cold start, which would leak into the other tests. i18next resolves the detected
 * language synchronously inside `init()` when the resources are bundled inline, so a
 * `languageChanged` listener registered after `init()` never sees the initial language.
 */
describe('i18n cold start', () => {
  it('mirrors the detected language onto <html lang> without an explicit changeLanguage', async () => {
    // Drop the listener the first module execution installed, so the fresh execution
    // has to declare the language itself rather than inheriting a live listener.
    i18n.off('languageChanged')
    document.documentElement.lang = 'en'
    localStorage.setItem('lang', 'ru')

    vi.resetModules()
    const fresh = (await import('../i18n')).default

    expect(fresh.language).toBe('ru')
    expect(document.documentElement.lang).toBe('ru')
  })
})
