import { useEffect } from 'react'
import { useThemeStore } from './store/themeStore'
import { useAppStore } from './store/appStore'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import ChartPanel from './components/ChartPanel'
import SentimentPanel from './components/SentimentPanel'
import StrategyBuilder from './components/StrategyBuilder'
import BrokerPanel from './components/BrokerPanel'
import Disclaimer from './components/Disclaimer'

export default function App() {
  const { theme } = useThemeStore()
  const { activeTab } = useAppStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'chart': return <ChartPanel />
      case 'sentiment': return <><Disclaimer /><SentimentPanel /></>
      case 'strategy': return <StrategyBuilder />
      case 'broker': return <><Disclaimer /><BrokerPanel /></>
      default: return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar />
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {renderTab()}
      </main>
    </div>
  )
}
