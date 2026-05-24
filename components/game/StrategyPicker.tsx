'use client'
import { STRATEGIES, type Strategy } from '@/hooks/useStrategy'

interface StrategyPickerProps { onSelect: (s: Strategy) => void; gameTitle?: string }

export default function StrategyPicker({ onSelect, gameTitle }: StrategyPickerProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-[60vh] justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Wie willst du spielen?</h2>
        {gameTitle && <p className="text-gray-500">{gameTitle}</p>}
      </div>
      <div className="grid gap-3 w-full max-w-sm">
        {STRATEGIES.map(s => (
          <button key={s.id} onClick={() => onSelect(s)}
            className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-400 hover:shadow-md transition text-left">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="font-bold text-gray-900">{s.label}</p>
              <p className="text-sm text-gray-500">{s.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
