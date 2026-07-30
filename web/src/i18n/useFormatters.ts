import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Locale-bound Intl wrappers. Formatting lives here rather than in the translation
 * files so translators never edit format strings.
 */
export function useFormatters() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  return useMemo(() => {
    const date = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const dateTime = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    const number = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
    })

    return {
      /** `2026-07-31` -> `31 Jul 2026` / `31 июл. 2026` */
      formatDate: (iso: string) => date.format(new Date(`${iso}T00:00:00`)),
      formatDateTime: (iso: string) => dateTime.format(new Date(iso)),
      formatWeight: (kg: number) => `${number.format(kg)} ${t('units.kg')}`,
    }
  }, [locale, t])
}
