import { Link, Outlet } from 'react-router'
import { ThemeToggle } from './ThemeToggle'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            Delivery Orders
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/orders/new" className="text-sm text-link underline">
              New order
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
