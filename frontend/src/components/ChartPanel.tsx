import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useAppStore } from '../store/appStore'
import { useThemeStore } from '../store/themeStore'

const INTERVALS = ['1m', '5m', '15m', '1h', '1D', '1W']
const INDICATORS = ['SMA', 'EMA', 'RSI', 'MACD', 'BB', 'VWAP']

interface OHLCBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function ChartPanel() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<ReturnType<typeof createChart> | null>(null)
  const { selectedSymbol, selectedInterval, setInterval, setSymbol } = useAppStore()
  const { theme } = useThemeStore()
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['SMA'])

  const { data: ohlc } = useQuery<OHLCBar[]>({
    queryKey: ['ohlc', selectedSymbol, selectedInterval],
    queryFn: () => axios.get(`/api/market/ohlc/${selectedSymbol}?interval=${selectedInterval}`).then(r => r.data),
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (!chartRef.current) return
    const isDark = theme === 'dark'

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#0f172a' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#1e293b' : '#f3f4f6' },
        horzLines: { color: isDark ? '#1e293b' : '#f3f4f6' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: isDark ? '#334155' : '#e5e7eb' },
      timeScale: {
        borderColor: isDark ? '#334155' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartRef.current.clientWidth,
      height: 450,
    })

    chartInstance.current = chart

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    if (ohlc && ohlc.length > 0) {
      const bars = ohlc.map(b => ({
        time: b.time as unknown as import('lightweight-charts').Time,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }))
      candleSeries.setData(bars)
      chart.timeScale().fitContent()
    }

    const handleResize = () => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartInstance.current = null
    }
  }, [ohlc, theme])

  const toggleIndicator = (ind: string) => {
    setActiveIndicators(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={selectedSymbol}
          onChange={e => setSymbol(e.target.value)}
          className="text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-1.5"
        >
          {['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {INTERVALS.map(iv => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedInterval === iv
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>

        <div className="flex gap-1 ml-auto">
          {INDICATORS.map(ind => (
            <button
              key={ind}
              onClick={() => toggleIndicator(ind)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                activeIndicators.includes(ind)
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div ref={chartRef} className="w-full" />
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-500 flex items-center gap-4">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500 inline-block" /> Bullish candle</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500 inline-block" /> Bearish candle</span>
        <span className="ml-auto">Powered by TradingView Lightweight Charts</span>
      </div>
    </div>
  )
}
