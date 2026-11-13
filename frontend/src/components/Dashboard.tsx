import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import axios from 'axios'

const SYMBOLS = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY']

interface Quote {
  symbol: string
  ltp: number
  open: number
  high: number
  low: number
  close: number
  change: number
  change_pct: number
  volume: number
}

function QuoteCard({ symbol }: { symbol: string }) {
  const { data, isLoading } = useQuery<Quote>({
    queryKey: ['quote', symbol],
    queryFn: () => axios.get(`/api/market/quote/${symbol}`).then(r => r.data),
    refetchInterval: 5000,
  })

  if (isLoading) return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 animate-pulse h-28" />
  )

  const isPositive = (data?.change_pct ?? 0) >= 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{data?.symbol ?? symbol}</span>
        {isPositive
          ? <TrendingUp size={16} className="text-green-500" />
          : <TrendingDown size={16} className="text-red-500" />}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        ₹{data?.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) ?? '—'}
      </div>
      <div className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{data?.change?.toFixed(2) ?? '0.00'} ({isPositive ? '+' : ''}{data?.change_pct?.toFixed(2) ?? '0.00'}%)
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        Vol: {data?.volume?.toLocaleString('en-IN') ?? '—'}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-blue-500" size={20} />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Market Overview</h1>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
          Delayed data · Prototyping mode
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {SYMBOLS.map(s => <QuoteCard key={s} symbol={s} />)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Market Breadth</h2>
          </div>
          <MarketBreadth />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-green-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Market Status</h2>
          </div>
          <MarketStatus />
        </div>
      </div>
    </div>
  )
}

function MarketBreadth() {
  const advances = 32; const declines = 18
  const pct = Math.round((advances / 50) * 100)
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-green-500 font-medium">▲ Advances: {advances}</span>
        <span className="text-red-500 font-medium">▼ Declines: {declines}</span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Nifty 50 • {pct}% advancing</div>
    </div>
  )
}

function MarketStatus() {
  const now = new Date()
  const h = now.getHours(), m = now.getMinutes()
  const isOpen = h >= 9 && (h < 15 || (h === 15 && m <= 30))
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          NSE/BSE: <span className={isOpen ? 'text-green-500' : 'text-gray-500'}>{isOpen ? 'Open' : 'Closed'}</span>
        </span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">Session: 09:15 – 15:30 IST</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">Pre-open: 09:00 – 09:15 IST</div>
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-lg p-3 mt-2">
        <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Data Source</div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">yfinance (delayed ~15 min) · Connect broker API for live data</div>
      </div>
    </div>
  )
}
