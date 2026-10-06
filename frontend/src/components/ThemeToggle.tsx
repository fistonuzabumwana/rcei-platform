import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-[#F1F5F9] hover:bg-slate-200 dark:hover:bg-[#374151] transition-colors shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center cursor-pointer"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
    </button>
  )
}
