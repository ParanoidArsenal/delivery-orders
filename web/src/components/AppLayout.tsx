import { Button } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useNavigate } from 'react-router'
import { BrandMark } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

export function AppLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <BrandMark />
            {t('app.title')}
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="primary" onClick={() => void navigate('/orders/new')}>
              {t('nav.newOrder')}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
