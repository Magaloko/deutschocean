'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameSession } from '@/hooks/useGameSession'
import { playCorrect, playWrong, playComplete, speak } from '@/lib/game/sounds'
import Icon from '@/components/ui/Icon'
import StarsRow from '@/components/ui/StarsRow'

export interface LevelConfig {
  missionId: string
  label:     string
  rounds:    number
  [key: string]: unknown  // min, max, tables, itemCount etc.
}

export interface GameConfig {
  1: LevelConfig
  2: LevelConfig
  3: LevelConfig
}

export interface Round {
  answer:       number | string
  options:      (number | string)[]
  explanation?: string
  [key: string]: unknown
}

interface MathGameEngineProps {
  gameTitle:      string
  config:         GameConfig
  buildRounds:    (level: number, cfg: LevelConfig) => Round[]
  renderQuestion: (round: Round) => React.ReactNode
  speakQuestion:  (round: Round) => string
  formatOption?:  (opt: number | string) => string
}

function calcStars(score: number, total: number) {
  if (score === total)                    return 3
  if (score >= Math.ceil(total * 0.7))   return 2
  return 1
}

export default function MathGameEngine({ gameTitle, config, buildRounds, renderQuestion, speakQuestion, formatOption = String }: MathGameEngineProps) {
  const router = useRouter()
  const { completeSession, saving } = useGameSession()

  const [phase,    setPhase]    = useState<'levelSelect' | 'playing' | 'result'>('levelSelect')
  const [level,    setLevel]    = useState<1 | 2 | 3 | null>(null)
  const [rounds,   setRounds]   = useState<Round[]>([])
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState<number | string | null>(null)
  const [score,    setScore]    = useState(0)

  const cfg   = level ? config[level] : null
  const round = rounds[idx]
  const TOTAL = rounds.length

  useEffect(() => {
    if (phase === 'playing' && round) speak(speakQuestion(round))
  }, [round, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function startLevel(lvl: 1 | 2 | 3) {
    setLevel(lvl)
    setRounds(buildRounds(lvl, config[lvl]))
    setIdx(0); setSelected(null); setScore(0)
    setPhase('playing')
  }

  function handleSelect(opt: number | string) {
    if (selected !== null) return
    setSelected(opt)
    if (opt === round.answer) { playCorrect(); setScore(s => s + 1) }
    else playWrong()
  }

  async function handleWeiter() {
    if (idx + 1 >= TOTAL) {
      playComplete()
      const finalScore = score + (selected === round.answer ? 0 : 0) // score already updated
      await completeSession({ missionId: cfg!.missionId, xpEarned: score * 2 + 5, stars: calcStars(score, TOTAL), correct: score, total: TOTAL })
      setPhase('result')
    } else {
      setIdx(i => i + 1); setSelected(null)
    }
  }

  // ── Level Select ─────────────────────────────────────────────────────────
  if (phase === 'levelSelect') return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100 transition">
          <Icon emoji="←" size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{gameTitle}</h1>
      </div>
      <p className="text-gray-500 mb-4">Wähle dein Level!</p>
      <div className="flex flex-col gap-3">
        {([1, 2, 3] as const).map(lvl => (
          <button key={lvl} onClick={() => startLevel(lvl)}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition">
            <StarsRow count={lvl} size={20} />
            <div className="flex-1 mx-4 text-left">
              <p className="font-semibold text-gray-900">Level {lvl}</p>
              <p className="text-sm text-gray-500">{config[lvl].label}</p>
            </div>
            <span className="text-gray-400 text-xl">›</span>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Result ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = calcStars(score, TOTAL)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full">
          <div className="text-6xl mb-4">
            <Icon emoji={stars === 3 ? '🏆' : '⭐'} size={64} color={stars === 3 ? '#ca8a04' : '#fbbf24'} />
          </div>
          <h2 className="text-2xl font-bold mb-2">{stars === 3 ? 'Perfekt! 🎉' : stars === 2 ? 'Super gemacht!' : 'Weiter üben!'}</h2>
          <p className="text-gray-500 mb-4">{score} von {TOTAL} richtig</p>
          <div className="flex justify-center mb-6"><StarsRow count={stars} max={3} size={28} /></div>
          <div className="flex gap-3">
            <button onClick={() => startLevel(level!)}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">
              Nochmal
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setPhase('levelSelect')} className="p-2 rounded-xl hover:bg-gray-100">
          <Icon emoji="←" size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-600">{gameTitle} · L{level}</span>
        <button onClick={() => speak(speakQuestion(round))} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Vorlesen">
          <Icon emoji="🔊" size={18} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(idx / TOTAL) * 100}%` }} />
        </div>
        <span className="text-xs text-gray-500 shrink-0">{idx + 1}/{TOTAL}</span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 flex items-center justify-center">
        {renderQuestion(round)}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {round.options.map(opt => {
          const isAnswer   = opt === round.answer
          const isSelected = opt === selected
          return (
            <button key={String(opt)} onClick={() => handleSelect(opt)} disabled={selected !== null}
              className={`py-4 rounded-2xl text-xl font-bold transition border-2 ${
                selected === null ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md' :
                isAnswer   ? 'bg-green-100 border-green-500 text-green-800' :
                isSelected ? 'bg-red-100   border-red-500   text-red-800'   :
                             'bg-white     border-gray-100  text-gray-400'
              }`}>
              {formatOption(opt)}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <div className="flex flex-col gap-3">
          <div className={`flex items-center gap-2 p-3 rounded-xl font-medium ${selected === round.answer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <Icon emoji={selected === round.answer ? '✅' : '❌'} size={20} />
            {selected === round.answer ? 'Richtig! 🎉' : `Richtig wäre: ${formatOption(round.answer)}`}
          </div>
          {round.explanation && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-800">
              <Icon emoji="💡" size={16} color="#f59e0b" />
              <span>{round.explanation}</span>
            </div>
          )}
          <button onClick={handleWeiter} disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {idx + 1 >= TOTAL ? '🏆 Ergebnis ansehen' : 'Weiter →'}
          </button>
        </div>
      )}
    </div>
  )
}
