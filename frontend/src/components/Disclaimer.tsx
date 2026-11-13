import { AlertTriangle } from 'lucide-react'

export default function Disclaimer() {
  return (
    <div className="mb-4 flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <p>
        <strong>Disclaimer:</strong> All signals and predictions are probabilistic research tools, not investment advice.
        Past backtest performance does not guarantee future results. You are solely responsible for compliance with SEBI's
        algo trading regulations and your broker's terms. Never trade with capital you cannot afford to lose.
      </p>
    </div>
  )
}
