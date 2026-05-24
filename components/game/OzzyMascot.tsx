'use client'
import type { OzzyMood } from '@/hooks/useOzzy'

interface OzzyMascotProps { mood?: OzzyMood; message?: string | null }

const MOOD_ANIM: Record<OzzyMood, string> = {
  idle:      '',
  correct:   'animate-bounce',
  wrong:     'animate-pulse',
  celebrate: 'animate-spin',
  thinking:  'animate-pulse',
  levelUp:   'animate-bounce',
  levelDown: 'animate-pulse',
}

const MOOD_BG: Record<OzzyMood, string> = {
  idle:      'bg-blue-50 border-blue-200',
  correct:   'bg-green-50 border-green-300',
  wrong:     'bg-red-50 border-red-300',
  celebrate: 'bg-yellow-50 border-yellow-300',
  thinking:  'bg-purple-50 border-purple-200',
  levelUp:   'bg-emerald-50 border-emerald-300',
  levelDown: 'bg-orange-50 border-orange-300',
}

export default function OzzyMascot({ mood = 'idle', message }: OzzyMascotProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${MOOD_BG[mood]}`}>
      <span className={`text-4xl select-none ${MOOD_ANIM[mood]}`} role="img" aria-label="Ozzy">
        🐙
      </span>
      {message && (
        <div className="relative bg-white rounded-xl px-3 py-2 text-sm font-medium text-gray-800 shadow-sm border border-gray-100">
          {message}
          <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
        </div>
      )}
    </div>
  )
}
