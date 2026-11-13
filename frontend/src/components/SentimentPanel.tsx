import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore'

interface Prediction {
  symbol: string
  direction: 'UP' | 'DOWN' | 'SIDEWAYS'
  confidence: number
  sentiment_score: number
  rationale: string
  features: {
    rsi: number
    macd_signal: string
    pcr: number
    fii_net: number
    news_sentiment: string
  }
  timestamp: string
}

export default function SentimentPanel() {
  const { selectedSymbol } = useAppStore()

  const { data, isLoading, isError } = useQuery<Prediction>({
    queryKey: ['predict', selectedSymbol],
    queryFn: () => axios.get(`/api/predict/${selectedSymbol}`).then(r => r.data),
    refetchInterval: 60000,
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-purple-500" size={20} />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Market Signals</h1>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
          Research only · Not financial advice
        </span>
      </div>

      {isLoading && <LoadingSkeleton />}
      {isError && <ErrorState />}
      {data && <PredictionCard data={data} />}

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <FeatureCard title="Technical Analysis" items={[
          'RSI-14', 'MACD Signal', 'Bollinger Bands', 'ADX Trend', 'VWAP Position'
        ]} />
        <FeatureCard title="Options Flow" items={[
          'Put-Call Ratio', 'Open Interest', 'Max Pain Level', 'OI Change', 'IV Skew'
        ]} />
        <FeatureCard title="Market Cues" items={[
          'FII/DII Activity', 'GIFT Nifty', 'Global Markets', 'USD/INR', 'Crude Oil'
        ]} />
      </div>
    </div>
  )
}

function PredictionCard({ data }: { data: Prediction }) {
  const dirColor = data.direction === 'UP' ? 'text-green-500' : data.direction === 'DOWN' ? 'text-red-500' : 'text-yellow-500'
  const DirIcon = data.direction === 'UP' ? TrendingUp : data.direction === 'DOWN' ? TrendingDown : Minus
  const confPct = Math.round(data.confidence * 100)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{data.symbol} · Directional Signal</span>
          <span className="text-xs text-gray-400">{new Date(data.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className={`flex items-center gap-3 mb-4 ${dirColor}`}>
          <DirIcon size={36} />
          <div>
            <div className="text-3xl font-bold">{data.direction}</div>
            <div className="text-sm opacity-80">Confidence: {confPct}%</div>
          </div>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
          <div
            className={`h-full rounded-full ${data.direction === 'UP' ? 'bg-green-500' : data.direction === 'DOWN' ? 'bg-red-500' : 'bg-yellow-500'}`}
            style={{ width: `${confPct}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.rationale}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Signal Drivers</h3>
        <div className="space-y-3">
          <FeatureRow label="RSI (14)" value={data.features.rsi.toFixed(1)} type={data.features.rsi < 30 ? 'bull' : data.features.rsi > 70 ? 'bear' : 'neutral'} />
          <FeatureRow label="MACD" value={data.features.macd_signal} type={data.features.macd_signal === 'Bullish' ? 'bull' : 'bear'} />
          <FeatureRow label="Put-Call Ratio" value={data.features.pcr.toFixed(2)} type={data.features.pcr < 1 ? 'bull' : data.features.pcr > 1.3 ? 'bear' : 'neutral'} />
          <FeatureRow label="FII Net (₹Cr)" value={data.features.fii_net > 0 ? `+${data.features.fii_net}` : `${data.features.fii_net}`} type={data.features.fii_net > 0 ? 'bull' : 'bear'} />
          <FeatureRow label="News Sentiment" value={data.features.news_sentiment} type={data.features.news_sentiment === 'Positive' ? 'bull' : data.features.news_sentiment === 'Negative' ? 'bear' : 'neutral'} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Sentiment Score: <span className={data.sentiment_score > 0 ? 'text-green-500' : 'text-red-500'}>
              {data.sentiment_score > 0 ? '+' : ''}{(data.sentiment_score * 100).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ label, value, type }: { label: string; value: string; type: 'bull' | 'bear' | 'neutral' }) {
  const color = type === 'bull' ? 'text-green-500' : type === 'bear' ? 'text-red-500' : 'text-yellow-500'
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  )
}

function FeatureCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">{title}</h3>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {[0,1].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 animate-pulse h-56" />
      ))}
    </div>
  )
}

function ErrorState() {
  return (
    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3 mb-6">
      <AlertCircle className="text-red-500 shrink-0" />
      <div>
        <div className="font-medium text-red-700 dark:text-red-400">Unable to load prediction</div>
        <div className="text-sm text-red-600 dark:text-red-500">Backend service may be unavailable. Retrying…</div>
      </div>
    </div>
  )
}
