import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Briefcase, Shield, AlertTriangle, Activity, Lock } from 'lucide-react'

interface Position {
  symbol: string
  qty: number
  avg_price: number
  ltp: number
  pnl: number
  pnl_pct: number
}

export default function BrokerPanel() {
  const [broker, setBroker] = useState('paper')
  const [autoMode, setAutoMode] = useState(false)

  const { data: positions } = useQuery<Position[]>({
    queryKey: ['positions'],
    queryFn: () => axios.get('/api/broker/positions').then(r => r.data),
    refetchInterval: 5000,
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="text-blue-500" size={20} />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Broker Integration</h1>
        <span className="ml-auto px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
          Paper Trading Mode
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Positions
            </h3>
            {positions && positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-700">
                      <th className="pb-2">Symbol</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Avg Price</th>
                      <th className="pb-2">LTP</th>
                      <th className="pb-2">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                    {positions.map(p => (
                      <tr key={p.symbol}>
                        <td className="py-2 font-medium text-gray-900 dark:text-white">{p.symbol}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{p.qty}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">₹{p.avg_price.toFixed(2)}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">₹{p.ltp.toFixed(2)}</td>
                        <td className={`py-2 font-medium ${p.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {p.pnl >= 0 ? '+' : ''}₹{p.pnl.toFixed(0)} ({p.pnl_pct.toFixed(2)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                No open positions · Paper trading mode
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Risk Controls</h3>
            <div className="grid grid-cols-2 gap-4">
              <RiskControl label="Daily Max Loss" value="₹5,000" status="active" />
              <RiskControl label="Max Positions" value="3" status="active" />
              <RiskControl label="Order Mode" value={autoMode ? 'Full Auto' : 'Manual Confirm'} status={autoMode ? 'warn' : 'active'} />
              <RiskControl label="Position Size" value="10% of capital" status="active" />
            </div>
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-trading mode</span>
              <button
                onClick={() => setAutoMode(v => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoMode ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </button>
              {autoMode && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> SEBI compliance required
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock size={16} className="text-blue-500" /> Broker Connection
            </h3>
            <div className="space-y-2">
              {[
                { id: 'paper', label: 'Paper Trading', desc: 'Simulated · No real money' },
                { id: 'zerodha', label: 'Zerodha Kite', desc: 'OAuth · ₹2000/month' },
                { id: 'upstox', label: 'Upstox', desc: 'OAuth · Free tier' },
                { id: 'angel', label: 'Angel One', desc: 'OAuth · Free' },
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setBroker(b.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    broker === b.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{b.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{b.desc}</div>
                </button>
              ))}
            </div>
            {broker !== 'paper' && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300">
                <Shield size={12} className="inline mr-1" />
                Requires static IP, OAuth 2FA, and SEBI-registered algo ID per SEBI guidelines (Apr 2026).
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Audit Log</h3>
            <div className="space-y-2 text-xs">
              {[
                { time: '09:15:03', msg: 'Session started (paper)', type: 'info' },
                { time: '09:15:10', msg: 'Strategy loaded: My Strategy', type: 'info' },
                { time: '09:16:42', msg: 'Signal: NIFTY50 UP (67%)', type: 'signal' },
                { time: '09:16:43', msg: 'Risk check passed', type: 'ok' },
              ].map((entry, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-400 w-14 shrink-0">{entry.time}</span>
                  <span className={
                    entry.type === 'signal' ? 'text-blue-500' :
                    entry.type === 'ok' ? 'text-green-500' :
                    'text-gray-600 dark:text-gray-400'
                  }>{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RiskControl({ label, value, status }: { label: string; value: string; status: 'active' | 'warn' | 'off' }) {
  const color = status === 'active' ? 'text-green-500' : status === 'warn' ? 'text-amber-500' : 'text-gray-400'
  const dot = status === 'active' ? 'bg-green-400' : status === 'warn' ? 'bg-amber-400' : 'bg-gray-400'
  return (
    <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className={`text-sm font-medium ${color}`}>{value}</div>
    </div>
  )
}
