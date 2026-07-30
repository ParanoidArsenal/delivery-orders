import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type Language } from '../i18n'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const active = i18n.language.split('-')[0] as Language

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="flex overflow-hidden rounded-lg border border-border text-xs"
    >
      {SUPPORTED_LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={active === language}
          onClick={() => void i18n.changeLanguage(language)}
          className={
            active === language
              ? 'bg-background-tertiary px-2.5 py-1 font-medium text-foreground'
              : 'px-2.5 py-1 text-muted hover:text-foreground'
          }
        >
          {t(`language.${language}`)}
        </button>
      ))}
    </div>
  )
}
