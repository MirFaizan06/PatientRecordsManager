import { useTheme } from '../hooks/useTheme'
import { SunIcon, MoonIcon } from './Icons'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="btn btn-ghost btn-icon"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
    </button>
  )
}
