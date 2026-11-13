import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Plus, Play, Settings, CheckCircle, XCircle } from 'lucide-react'
import Disclaimer from './Disclaimer'

interface Strategy {
  id: string
  name: string
  rules: Rule[]
  created_at: string
}

interface Rule {
  id: string
  indicator: string
  operator: string
  value: number | string
  action: 'BUY' | 'SELL'
}

interface BacktestResult {
  total_return: number
  cagr: number
  sharpe: number
  max_drawdown: number
  win_rate: number
  num_trades: number
  equity_curve: { date: string; value: number }[]
}

export default function StrategyBuilder() {
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', indicator: 'RSI', operator: '<', value: 30, action: 'BUY' },
  ])
  const [strategyName, setStrategyName] = useState('My Strategy')
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [symbol, setSymbol] = useState('NIFTY50')
  const [capital, setCapital] = useState(100000)

  const { data: strategies } = useQuery<Strategy[]>({
    queryKey: ['strategies'],
    queryFn: () => axios.get('/api/strategies').then(r => r.data),
  })

  const backtestMutation = useMutation({
    mutationFn: (payload: object) => axios.post('/api/backtest/run', payload).then(r => r.data),
    onSuccess: (data) => setBacktestResult(data),
  })

  const addRule = () => {
    setRules(prev => [...prev, {
      id: Date.now().toString(),
      indicator: 'RSI',
      operator: '<',
      value: 30,
      action: 'BUY',
    }])
  }

  const updateRule = (id: string, field: keyof Rule, val: string | number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  const removeRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id))

  const runBacktest = () => {
    backtestMutation.mutate({
      strategy_id: 'custom',
      rules,
      symbol,
      start_date: '2023-01-01',
      end_date: '2024-01-01',
      capital,
    })
  }

  return (
    <div>
      <Disclaimer />
      <div className="flex items-center gap-2 mb-6">
        <Settings className="text-blue-500" size={20} />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Strategy Builder & Backtesting</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <input
                value={strategyName}
                onChange={e => setStrategyName(e.target.value)}
                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-slate-600 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
              />
              <button onClick={addRule} className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600">
                <Plus size={16} /> Add Rule
              </button>
            </div>

            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-xs text-gray-400 w-6">{idx === 0 ? 'IF' : 'AND'}</span>
                  <select
                    value={rule.indicator}
                    onChange={e => updateRule(rule.id, 'indicator', e.target.value)}
                    className="text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
                  >
                    {['RSI', 'EMA_20', 'EMA_50', 'MACD', 'VWAP', 'BB_UPPER', 'BB_LOWER', 'ADX'].map(i => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                  <select
                    value={rule.operator}
                    onChange={e => updateRule(rule.id, 'operator', e.target.value)}
                    className="text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
                  >
                    {['<', '>', '==', '>=', '<=', 'crosses_above', 'crosses_below'].map(op => (
                      <option key={op}>{op}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={rule.value as number}
                    onChange={e => updateRule(rule.id, 'value', parseFloat(e.target.value))}
                    className="text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 w-20"
                  />
                  <span className="text-xs text-gray-400">THEN</span>
                  <select
                    value={rule.action}
                    onChange={e => updateRule(rule.id, 'action', e.target.value)}
                    className="text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 font-medium text-green-600 dark:text-green-400"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                  <button onClick={() => removeRule(rule.id)} className="ml-auto text-gray-400 hover:text-red-500">
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Backtest Settings</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Symbol</label>
                <select
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="mt-1 w-full text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1.5"
                >
                  {['NIFTY50', 'SENSEX', 'BANKNIFTY', 'RELIANCE', 'TCS'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Capital (₹)</label>
                <input
                  type="number"
                  value={capital}
                  onChange={e => setCapital(Number(e.target.value))}
                  className="mt-1 w-full text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1.5"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={runBacktest}
                  disabled={backtestMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-1.5 px-4 rounded text-sm font-medium transition-colors"
                >
                  <Play size={14} />
                  {backtestMutation.isPending ? 'Running…' : 'Run Backtest'}
                </button>
              </div>
            </div>
          </div>

          {backtestResult && <BacktestResultCard result={backtestResult} />}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Saved Strategies</h3>
            {strategies && strategies.length > 0 ? (
              <ul className="space-y-2">
                {strategies.map(s => (
                  <li key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.rules.length} rules</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">No saved strategies yet.</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Risk Controls</h3>
            <div className="space-y-3 text-sm">
              {[
                ['Daily Max Loss', '₹5,000'],
                ['Max Position Size', '10%'],
                ['Max Open Positions', '3'],
                ['Order Mode', 'Manual Confirm'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BacktestResultCard({ result }: { result: BacktestResult }) {
  const metrics = [
    { label: 'Total Return', value: `${result.total_return >= 0 ? '+' : ''}${result.total_return.toFixed(2)}%`, pos: result.total_return >= 0 },
    { label: 'CAGR', value: `${result.cagr.toFixed(2)}%`, pos: result.cagr >= 0 },
    { label: 'Sharpe Ratio', value: result.sharpe.toFixed(2), pos: result.sharpe >= 1 },
    { label: 'Max Drawdown', value: `${result.max_drawdown.toFixed(2)}%`, pos: false },
    { label: 'Win Rate', value: `${result.win_rate.toFixed(1)}%`, pos: result.win_rate >= 50 },
    { label: 'Total Trades', value: result.num_trades.toString(), pos: true },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle size={18} className="text-green-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Backtest Results</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
            <div className={`text-lg font-bold ${m.pos ? 'text-green-500' : 'text-red-500'}`}>{m.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
