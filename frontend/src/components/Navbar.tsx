import { Sun, Moon, TrendingUp, BarChart2, Brain, Settings, Briefcase } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useAppStore } from '../store/appStore'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'chart', label: 'Charts', icon: BarChart2 },
  { id: 'sentiment', label: 'AI Signals', icon: Brain },
  { id: 'strategy', label: 'Strategy', icon: Settings },
  { id: 'broker', label: 'Broker', icon: Briefcase },
]

export default function Navbar() {
  const { theme, toggleTheme } = useThemeStore()
  const { activeTab, setTab } = useAppStore()

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-500" size={22} />
          <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
            Market<span className="text-blue-500">Analysis</span>Pro
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
