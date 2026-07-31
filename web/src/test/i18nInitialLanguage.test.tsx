import { describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'

describe('i18n cold start', () => {
  it('mirrors the detected language onto <html lang> without an explicit changeLanguage', async () => {
    i18n.off('languageChanged')
    document.documentElement.lang = 'en'
    localStorage.setItem('lang', 'ru')

    vi.resetModules()
    const fresh = (await import('../i18n')).default

    expect(fresh.language).toBe('ru')
    expect(document.documentElement.lang).toBe('ru')
  })
})
