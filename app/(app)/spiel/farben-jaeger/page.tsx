'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameSession } from '@/hooks/useGameSession'
import { playCorrect, playWrong, playComplete, speak } from '@/lib/game/sounds'
import { shuffle } from '@/lib/game/mathUtils'
import { FARBEN_RUNDEN } from '@/lib/game/gameData'
import Icon from '@/components/ui/Icon'
import StarsRow from '@/components/ui/StarsRow'

interface FarbItem { id: number; emoji: string; hex: string; isTarget: boolean }
interface FarbRunde { difficulty: number; targetColor: string; targetHex: string; items: FarbItem[] }

export default function FarbenJaeger() {
  const router = useRouter()
  const { completeSession, saving } = useGameSession()

  const [level,setLevel]       = useState<1|2|3|null>(null)
  const [runden,setRunden]     = useState<FarbRunde[]>([])
  const [idx,setIdx]           = useState(0)
  const [selected,setSelected] = useState<Set<number>>(new Set())
  const [checked,setChecked]   = useState(false)
  const [lastOk,setLastOk]     = useState(false)
  const [score,setScore]       = useState(0)
  const [phase,setPhase]       = useState<'playing'|'result'>('playing')

  const TOTAL = runden.length
  const runde = runden[idx]

  useEffect(() => { if (runde) speak(`Tippe alles ${runde.targetColor}!`) }, [idx, runde])

  function startLevel(lvl: 1|2|3) {
    const filtered = (FARBEN_RUNDEN as FarbRunde[]).filter(r => r.difficulty === lvl)
    setRunden(shuffle(filtered).slice(0, 6))
    setLevel(lvl); setIdx(0); setSelected(new Set()); setChecked(false); setLastOk(false); setScore(0); setPhase('playing')
  }

  function toggleItem(id: number) {
    if (checked) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleCheck() {
    const targets = new Set(runde.items.filter(i => i.isTarget).map(i => i.id))
    const perfect = [...selected].every(id => targets.has(id)) && [...targets].every(id => selected.has(id))
    if (perfect) { setScore(s => s+1); playCorrect() } else playWrong()
    setLastOk(perfect); setChecked(true)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) setPhase('result')
    else { setIdx(i=>i+1); setSelected(new Set()); setChecked(false); setLastOk(false) }
  }

  async function handleFinish() {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    playComplete()
    await completeSession({ missionId: `farben-jaeger-${level}`, xpEarned: score*2, stars, correct: score, total: TOTAL })
    router.push('/dashboard')
  }

  if (!level) return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100">←</button>
        <h1 className="text-2xl font-bold">Farbenjäger 🎨</h1>
      </div>
      <p className="text-gray-500 mb-4">Wähle dein Level!</p>
      <div className="flex flex-col gap-3">
        {([1,2,3] as const).map(lvl => (
          <button key={lvl} onClick={() => startLevel(lvl)}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-pink-300 hover:shadow-md transition">
            <StarsRow count={lvl} size={20} />
            <div className="flex-1 mx-4 text-left">
              <p className="font-semibold">Level {lvl}</p>
              <p className="text-sm text-gray-500">{lvl === 1 ? 'Leicht' : lvl === 2 ? 'Mittel' : 'Schwer'}</p>
            </div>
            <span className="text-gray-400 text-xl">›</span>
          </button>
        ))}
      </div>
    </div>
  )

  if (phase === 'result') {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full">
          <Icon emoji={score >= TOTAL ? '🎨' : '⭐'} size={64} color={score >= TOTAL ? '#ec4899' : '#fbbf24'} />
          <h2 className="text-2xl font-bold mt-3 mb-1">{score >= TOTAL ? 'Super Farbenjäger!' : 'Gut gemacht!'}</h2>
          <p className="text-gray-500 mb-2">{score}/{TOTAL} richtig</p>
          <div className="flex justify-center gap-2 mb-6"><StarsRow count={stars} max={3} size={28} /></div>
          <button onClick={handleFinish} disabled={saving}
            className="w-full py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-50">
            {saving ? 'Speichert…' : 'Fertig'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100">←</button>
        <span className="font-semibold">Farbenjäger 🎨</span>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg">{idx+1}/{TOTAL}</span>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl border-2 border-gray-200" style={{ background: runde.targetHex }} />
          <span className="font-semibold">Tippe alles <strong style={{ color: runde.targetHex }}>{runde.targetColor.toUpperCase()}</strong>!</span>
          <button onClick={() => speak(`Tippe alles ${runde.targetColor}!`)} className="ml-auto p-2 rounded-xl hover:bg-gray-100" aria-label="Vorlesen"><Icon emoji="🔊" size={18}/></button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {runde.items.map(item => {
            const isSel = selected.has(item.id)
            const isCorrect = checked && item.isTarget
            const isWrong = checked && !item.isTarget && isSel
            const isMissed = checked && item.isTarget && !isSel
            return (
              <button key={item.id} onClick={() => toggleItem(item.id)} disabled={checked}
                className={`aspect-square rounded-2xl text-4xl flex items-center justify-center border-4 transition ${
                  isCorrect ? 'border-green-500 ring-4 ring-green-200' :
                  isWrong ? 'border-red-500 opacity-60' :
                  isMissed ? 'border-orange-400 animate-pulse' :
                  isSel ? 'border-blue-500 ring-2 ring-blue-200' :
                  'border-gray-200 hover:border-gray-300'
                }`}
                style={{ background: item.hex }}>{item.emoji}</button>
            )
          })}
        </div>

        {checked && (
          <div className={`mt-4 p-3 rounded-xl font-medium ${lastOk ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {lastOk ? `✓ Super! Alle ${runde.targetColor}en Karten gefunden!`
                    : `✗ Die ${runde.targetColor}en Karten: ${runde.items.filter(i => i.isTarget).map(i => i.emoji).join(' ')}`}
          </div>
        )}

        <div className="mt-4">
          {!checked
            ? <button onClick={handleCheck} className="w-full py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600">Überprüfen</button>
            : <button onClick={handleNext} className="w-full py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600">{idx+1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}</button>}
        </div>
      </div>
    </div>
  )
}
