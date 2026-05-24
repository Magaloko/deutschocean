interface ProgressBarProps { value?: number; max?: number; color?: 'primary' | 'green' | 'yellow' | 'red'; label?: string }

const colors = { primary:'bg-blue-500', green:'bg-green-500', yellow:'bg-yellow-400', red:'bg-red-500' }

export default function ProgressBar({ value = 0, max = 100, color = 'primary', label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span>{Math.round(pct)}%</span></div>}
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all ${colors[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
