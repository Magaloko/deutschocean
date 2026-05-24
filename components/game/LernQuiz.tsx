'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGameSession } from '@/hooks/useGameSession'
import { playCorrect, playWrong, playComplete } from '@/lib/game/sounds'
import Icon from '@/components/ui/Icon'
import StarsRow from '@/components/ui/StarsRow'
import type { Fach, FachFrage } from '@/lib/game/fachData'

const ANSWER_LABELS = ['A','B','C','D']

interface Props {
  fachId: string
  fachLabel: string
  fachEmoji: string
  fachColor: string
  levels: Fach['levels']
  fragen: Fach['fragen']
  missionPrefix: string
}

interface ShuffledOption { text: string; correct: boolean }
interface PlayingQuestion extends FachFrage { shuffledOptions: ShuffledOption[] }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

export default function LernQuiz({ fachLabel, fachEmoji, fachColor, levels, fragen, missionPrefix }: Props) {
  const router = useRouter()
  const { completeSession, saving } = useGameSession()

  const [phase,       setPhase]   = useState<'levelSelect'|'playing'|'result'>('levelSelect')
  const [activeLevel, setLevel]   = useState<number | null>(null)
  const [questions,   setQuestions] = useState<PlayingQuestion[]>([])
  const [idx,         setIdx]     = useState(0)
  const [selected,    setSelected]= useState<number | null>(null)
  const [score,       setScore]   = useState(0)

  const currentQ = questions[idx]
  const answered = selected !== null
  const total    = questions.length

  function startLevel(lvl: number) {
    const pool: FachFrage[] = fragen[lvl] ?? []
    const picked: PlayingQuestion[] = shuffle(pool).slice(0, 8).map(q => ({
      ...q,
      shuffledOptions: shuffle(q.options.map((text, i) => ({ text, correct: i === q.a }))),
    }))
    setQuestions(picked); setLevel(lvl); setIdx(0); setSelected(null); setScore(0); setPhase('playing')
  }

  const handleSelect = useCallback((optIdx: number) => {
    if (answered) return
    setSelected(optIdx)
    if (questions[idx].shuffledOptions[optIdx].correct) { setScore(s => s+1); playCorrect() } else playWrong()
  }, [answered, idx, questions])

  function handleNext() {
    if (idx + 1 >= total) { setPhase('result'); playComplete() }
    else { setIdx(i => i+1); setSelected(null) }
  }

  async function handleFinish() {
    const stars = score >= total ? 3 : score >= Math.ceil(total * 0.6) ? 2 : 1
    await completeSession({
      missionId: `${missionPrefix}-${activeLevel}`, xpEarned: score * 3,
      stars, correct: score, total,
    })
    router.push('/dashboard')
  }

  // ── Level Select ─────────────────────────────────────────────────────
  if (phase === 'levelSelect') return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-lg mx-auto">
      <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        <Icon emoji="←" size={14} /> Zurück
      </button>
      <div className="flex items-center gap-3 mb-2">
        <Icon emoji={fachEmoji} size={40} color={fachColor} />
        <h1 className="text-2xl font-bold" style={{ color: fachColor }}>{fachLabel}</h1>
      </div>
      <p className="text-gray-500 mb-6">Wähle dein Level und beweise dein Wissen!</p>
      <div className="grid gap-3">
        {Object.entries(levels).map(([lvl, meta]) => (
          <button key={lvl} onClick={() => startLevel(Number(lvl))}
            className="flex flex-col gap-1 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:shadow-md transition text-left"
            style={{ borderColor: fachColor + '22' }}>
            <div className="flex items-center gap-2">
              <Icon emoji={meta.emoji} size={28} color={fachColor} />
              <span className="font-bold text-gray-900">{meta.label}</span>
            </div>
            <span className="text-sm text-gray-500">{meta.desc}</span>
            <span className="text-sm font-semibold mt-1 flex items-center gap-1" style={{ color: fachColor }}>
              <Icon emoji="▶" size={12} color={fachColor} /> Starten
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Result ───────────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct = Math.round((score / total) * 100)
    const stars = score >= total ? 3 : score >= Math.ceil(total * 0.6) ? 2 : 1
    const msg = stars === 3 ? 'Perfekt! Du bist ein echter Profi!'
              : stars === 2 ? 'Super gemacht! Noch ein bisschen üben!'
              : 'Weiter so! Übung macht den Meister!'
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full">
          <Icon emoji={fachEmoji} size={56} color={fachColor} />
          <h2 className="text-xl font-bold mt-3 mb-2">{msg}</h2>
          <p className="text-gray-500 mb-4">{score}/{total} richtig ({pct}%)</p>
          <div className="flex justify-center mb-3"><StarsRow count={stars} max={3} size={28} /></div>
          <div className="text-sm font-semibold mb-6" style={{ color: fachColor }}>+{score * 3} XP verdient!</div>
          <div className="flex flex-col gap-2">
            <button onClick={handleFinish} disabled={saving}
              className="py-3 rounded-xl font-semibold text-white disabled:opacity-50"
              style={{ background: fachColor }}>
              ✓ Fertig & XP kassieren
            </button>
            <button onClick={() => startLevel(activeLevel!)}
              className="py-3 rounded-xl font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200">
              🔁 Nochmal spielen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ──────────────────────────────────────────────────────────
  const levelMeta = levels[activeLevel!]
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setPhase('levelSelect')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <Icon emoji="←" size={14} /> Level
        </button>
        <div className="flex-1 max-w-xs">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-2 rounded-full transition-all" style={{ width:`${(idx/total)*100}%`, background:fachColor }} />
          </div>
        </div>
        <span className="text-xs text-gray-500">{idx+1}/{total}</span>
        <span className="px-2 py-1 text-xs rounded-lg font-semibold flex items-center gap-1"
          style={{ background:fachColor+'20', color:fachColor }}>
          <Icon emoji="✓" size={12} color={fachColor} /> {score}
        </span>
      </div>

      <span className="self-start px-3 py-1 text-xs rounded-full font-semibold flex items-center gap-1"
        style={{ background:fachColor+'18', color:fachColor }}>
        <Icon emoji={levelMeta.emoji} size={14} color={fachColor} /> {levelMeta.label}
      </span>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-lg text-gray-900 leading-relaxed">{currentQ.q}</p>
      </div>

      <div className="flex flex-col gap-2">
        {currentQ.shuffledOptions.map((opt, i) => {
          let cls = 'bg-white border-gray-200 hover:border-blue-300'
          if (answered) {
            if (opt.correct) cls = 'bg-green-50 border-green-500'
            else if (i === selected) cls = 'bg-red-50 border-red-500'
            else cls = 'bg-white border-gray-100 opacity-60'
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={answered}
              className={`flex items-center gap-3 p-3 border-2 rounded-xl text-left transition ${cls}`}>
              <span className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center flex-shrink-0" style={{ background: fachColor }}>
                {ANSWER_LABELS[i]}
              </span>
              <span className="flex-1 text-sm text-gray-800">{opt.text}</span>
              {answered && opt.correct && <Icon emoji="✓" size={18} color="#10b981" />}
              {answered && !opt.correct && i === selected && <Icon emoji="❌" size={18} color="#ef4444" />}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="flex flex-col gap-3">
          <div className={`flex items-center gap-2 p-3 rounded-xl font-medium ${currentQ.shuffledOptions[selected!]?.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <Icon emoji={currentQ.shuffledOptions[selected!]?.correct ? '🎉' : '❌'} size={18} />
            <span>{currentQ.shuffledOptions[selected!]?.correct ? 'Richtig! Weiter so!' : 'Nicht ganz — die grüne Antwort war richtig!'}</span>
          </div>
          {currentQ.erklaerung && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-800">
              <Icon emoji="💡" size={16} color="#f59e0b" /><span>{currentQ.erklaerung}</span>
            </div>
          )}
          <button onClick={handleNext}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: fachColor }}>
            {idx + 1 >= total ? <><Icon emoji="📊" size={16} color="#fff" /> Ergebnis sehen</> : 'Weiter →'}
          </button>
        </div>
      )}
    </div>
  )
}
