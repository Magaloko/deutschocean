'use client'
import StarsRow from '@/components/ui/StarsRow'
import Button from '@/components/ui/Button'
import type { Strategy } from '@/hooks/useStrategy'

interface DebriefingProps {
  gameTitle:   string
  icon:        string
  color?:      string
  stars:       number
  xpEarned:   number
  score:       number
  total:       number
  hintsUsed?:  number
  timeSeconds?: number
  strategy?:   Strategy | null
  highlights?: string[]
  nextTip?:    string
  onContinue:  () => void
  onReplay?:   () => void
  saving?:     boolean
}

export default function Debriefing({ gameTitle, icon, color = '#6366f1', stars, xpEarned, score, total, hintsUsed = 0, timeSeconds, strategy, highlights = [], nextTip, onContinue, onReplay, saving }: DebriefingProps) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        {/* Icon + Titel */}
        <div className="text-6xl mb-3" style={{ filter:`drop-shadow(0 4px 8px ${color}44)` }}>{icon}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{gameTitle}</h1>
        <p className="text-gray-500 text-sm mb-6">Abschluss-Auswertung</p>

        {/* Sterne */}
        <div className="flex justify-center mb-4">
          <StarsRow count={stars} max={3} size={32} />
        </div>

        {/* Stats-Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-green-700">{accuracy}%</p>
            <p className="text-xs text-green-600">Genauigkeit</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-yellow-700">+{xpEarned}</p>
            <p className="text-xs text-yellow-600">XP</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-2xl font-bold text-blue-700">{score}/{total}</p>
            <p className="text-xs text-blue-600">Richtig</p>
          </div>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
            {highlights.map((h, i) => (
              <p key={i} className="text-sm text-gray-700">• {h}</p>
            ))}
          </div>
        )}

        {/* Zusatz-Info */}
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 mb-6">
          {hintsUsed > 0 && <span>💡 {hintsUsed} Hinweis{hintsUsed > 1 ? 'e' : ''}</span>}
          {timeSeconds && <span>⏱ {Math.floor(timeSeconds / 60)}:{String(timeSeconds % 60).padStart(2, '0')}</span>}
          {strategy && <span>{strategy.icon} {strategy.label}-Modus</span>}
        </div>

        {/* Tipp */}
        {nextTip && (
          <p className="text-sm text-indigo-600 bg-indigo-50 rounded-xl p-3 mb-6">💡 {nextTip}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {onReplay && (
            <Button variant="secondary" onClick={onReplay} className="flex-1">
              🔁 Nochmal
            </Button>
          )}
          <Button onClick={onContinue} loading={saving} className="flex-1">
            Weiter →
          </Button>
        </div>
      </div>
    </div>
  )
}
