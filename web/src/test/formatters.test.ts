import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { useFormatters } from '../i18n/useFormatters'

describe('useFormatters', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('formats a date for English', () => {
    const { result } = renderHook(() => useFormatters())
    expect(result.current.formatDate('2026-07-31')).toMatch(/31/)
    expect(result.current.formatDate('2026-07-31')).toMatch(/Jul/i)
  })

  it('formats a date for Russian', async () => {
    await i18n.changeLanguage('ru')
    const { result } = renderHook(() => useFormatters())
    const formatted = result.current.formatDate('2026-07-31')
    expect(formatted).toMatch(/31/)
    expect(formatted).toMatch(/июл/i)
  })

  it('appends the localized unit to a weight', async () => {
    const { result: en } = renderHook(() => useFormatters())
    expect(en.current.formatWeight(7.25)).toBe('7.25 kg')

    await i18n.changeLanguage('ru')
    const { result: ru } = renderHook(() => useFormatters())
    expect(ru.current.formatWeight(7.25)).toMatch(/кг$/)
  })

  it('does not pad whole numbers with decimals', () => {
    const { result } = renderHook(() => useFormatters())
    expect(result.current.formatWeight(100)).toBe('100 kg')
  })
})
