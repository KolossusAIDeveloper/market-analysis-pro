import { create } from 'zustand'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'market-analysis-pro-theme'

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: next })
    localStorage.setItem(STORAGE_KEY, next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
}))
