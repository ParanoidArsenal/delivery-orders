import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import i18n from '../i18n'

describe('localization', () => {
  it('switches rendered copy between English and Russian', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    expect(i18n.t('orders.list.title')).toBe('Orders')

    await user.click(screen.getByRole('button', { name: 'RU' }))
    expect(i18n.language).toBe('ru')
    expect(i18n.t('orders.list.title')).toBe('Заказы')

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(i18n.t('orders.list.title')).toBe('Orders')
  })

  it('marks the active language as pressed', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'RU' }))
    expect(screen.getByRole('button', { name: 'RU' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('uses the correct Russian plural form for the order count', async () => {
    await i18n.changeLanguage('ru')

    expect(i18n.t('orders.count', { count: 1 })).toBe('1 заказ')
    expect(i18n.t('orders.count', { count: 3 })).toBe('3 заказа')
    expect(i18n.t('orders.count', { count: 11 })).toBe('11 заказов')
    expect(i18n.t('orders.count', { count: 21 })).toBe('21 заказ')
  })

  it('uses English plurals for the order count', async () => {
    expect(i18n.t('orders.count', { count: 1 })).toBe('1 order')
    expect(i18n.t('orders.count', { count: 5 })).toBe('5 orders')
  })

  it('sets the document language', async () => {
    await i18n.changeLanguage('ru')
    expect(document.documentElement.lang).toBe('ru')
  })

  it('has no missing keys between the two locales', async () => {
    const flatten = (value: unknown, prefix = ''): string[] =>
      typeof value === 'object' && value !== null
        ? Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
            flatten(child, prefix ? `${prefix}.${key}` : key),
          )
        : [prefix]

    const en = flatten(i18n.getResourceBundle('en', 'translation')).filter(
      (key) => !key.startsWith('orders.count'),
    )
    const ru = flatten(i18n.getResourceBundle('ru', 'translation')).filter(
      (key) => !key.startsWith('orders.count'),
    )

    expect(ru.sort()).toEqual(en.sort())
  })
})
