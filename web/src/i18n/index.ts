import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ru from './locales/ru.json'

export const SUPPORTED_LANGUAGES = ['en', 'ru'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
export const LANGUAGE_STORAGE_KEY = 'lang'

/**
 * Keep the document's declared language and title in sync. Registered BEFORE `init()`:
 * because the resources are bundled inline, i18next resolves the detected language
 * synchronously inside `init()` and emits `languageChanged` before that call returns,
 * so a listener added afterwards would miss the initial language.
 */
function syncDocument(language: string) {
  document.documentElement.lang = language
  // The tab title is outside React's tree, so it needs updating explicitly —
  // otherwise a fully Russian UI sits under an English tab.
  document.title = i18n.t('app.title')
}

i18n.on('languageChanged', syncDocument)

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      // React already escapes rendered values.
      escapeValue: false,
    },
  })

// Belt and braces for the case where detection resolves after init returns.
if (i18n.resolvedLanguage) {
  syncDocument(i18n.resolvedLanguage)
}

export default i18n
