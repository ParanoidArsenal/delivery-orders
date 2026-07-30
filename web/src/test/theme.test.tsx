import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from '../components/ThemeToggle'
import { THEME_STORAGE_KEY, ThemeProvider } from '../theme/ThemeProvider'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to light', () => {
    renderToggle()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('toggles to dark and back, updating the document attribute', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('dark')

    await user.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('persists the choice', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button'))
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('restores a persisted dark theme on mount', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    renderToggle()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('exposes an accessible label that reflects the next action', async () => {
    const user = userEvent.setup()
    renderToggle()

    expect(screen.getByRole('button')).toHaveAccessibleName(/dark/i)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAccessibleName(/light/i)
  })
})
