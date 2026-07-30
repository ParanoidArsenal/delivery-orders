import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'
import i18n from '../i18n'

// Tests assert English copy unless they change the language explicitly.
beforeEach(async () => {
  await i18n.changeLanguage('en')
})
