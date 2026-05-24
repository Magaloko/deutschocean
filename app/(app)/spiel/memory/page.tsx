'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameSession } from '@/hooks/useGameSession'
import { playCoin, playWrong, playComplete, speak } from '@/lib/game/sounds'
import { shuffle } from '@/lib/game/mathUtils'
import { MEMORY_KARTEN } from '@/lib/game/gameData'
import Icon from '@/components/ui/Icon'
import StarsRow from '@/components/ui/StarsRow'

interface MemKarte { id: string; emoji: string; name: string }
interface Card { uid: string; pairId: string; emoji: string; name: string }

const LEVEL_SIZES: Record<1|2|3, number[]> = { 1:[4,6,8], 2:[4,8,12], 3:[6,10,16] }
const XP_MAP: Record<1|2|3, number> = { 1:15, 2:18, 3:22 }

function buildCards(size: number): Card[] {
  const pairs = shuffle(MEMORY_KARTEN as MemKarte[]).slice(0, size/2)
  const cards: Card[] = []
  pairs.forEach(c => {
    cards.push({ uid: `${c.id}-a`, pairId: c.id, emoji: c.emoji, name: c.name })
    cards.push({ uid: `${c.id}-b`, pairId: c.id, emoji: c.emoji, name: c.name })
  })
  return shuffle(cards)
}

export default function MemorySpiel() {
  const router = useRouter()
  const { completeSession, saving } = useGameSession()

  const [diffLevel,setDiff] = useState<1|2|3|null>(null)
  const [level,setLevel] = useState(0)
  const [cards,setCards] = useState<Card[]>([])
  const [flipped,setFlipped] = useState<string[]>([])
  const [matched,setMatched] = useState<Set<string>>(new Set())
  const [moves,setMoves] = useState(0)
  const [locked,setLocked] = useState(false)
  const [levelDone,setLevelDone] = useState(false)
  const [phase,setPhase] = useState<'playing'|'result'>('playing')

  function startDiff(dl: 1|2|3) {
    setDiff(dl); setLevel(0); setCards(buildCards(LEVEL_SIZES[dl][0]))
    setFlipped([]); setMatched(new Set()); setMoves(0); setLocked(false); setLevelDone(false); setPhase('playing')
    speak('Finde alle gleichen Paare!')
  }

  function handleCardClick(card: Card) {
    if (locked || matched.has(card.pairId) || flipped.includes(card.uid) || flipped.length >= 2) return
    const next = [...flipped, card.uid]
    setFlipped(next)
    if (next.length === 2) {
      setMoves(m => m+1)
      const [c1,c2] = next.map(uid => cards.find(c => c.uid === uid)!)
      if (c1.pairId === c2.pairId) {
        playCoin()
        const newMatched = new Set([...matched, c1.pairId])
        setMatched(newMatched); setFlipped([])
        if (newMatched.size === cards.length/2) setTimeout(() => setLevelDone(true), 400)
      } else {
        playWrong(); setLocked(true)
        setTimeout(() => { setFlipped([]); setLocked(false) }, 900)
      }
    }
  }

  function advanceLevel() {
    if (!diffLevel) return
    const sizes = LEVEL_SIZES[diffLevel]
    if (level+1 >= sizes.length) setPhase('result')
    else {
      const nl = level+1
      setLevel(nl); setCards(buildCards(sizes[nl]))
      setFlipped([]); setMatched(new Set()); setMoves(0); setLevelDone(false); setLocked(false)
    }
  }

  async function handleFinish() {
    playComplete()
    await completeSession({ missionId: `memory-${diffLevel}`, xpEarned: XP_MAP[diffLevel!], stars: 3, correct: 3, total: 3 })
    router.push('/dashboard')
  }

  if (phase === 'result') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full">
        <div className="text-6xl mb-4">🃏</div>
        <h2 className="text-2xl font-bold mb-1">Memory Meister!</h2>
        <p className="text-gray-500 mb-4">Alle 3 Level geschafft</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">+{XP_MAP[diffLevel!]} XP</span>
          <StarsRow count={3} max={3} size={24} />
        </div>
        <button onClick={handleFinish} disabled={saving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Speichert…' : 'Speichern'}
        </button>
      </div>
    </div>
  )

  if (!diffLevel) return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100">←</button>
        <h1 className="text-2xl font-bold">Memory 🃏</h1>
      </div>
      <p className="text-gray-500 mb-4">Wähle dein Level!</p>
      <div className="flex flex-col gap-3">
        {([1,2,3] as const).map(lvl => (
          <button key={lvl} onClick={() => startDiff(lvl)}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-md transition">
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

  const sizes = LEVEL_SIZES[diffLevel]
  const cols = cards.length <= 4 ? 2 : cards.length === 6 ? 3 : 4

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100">←</button>
        <span className="font-semibold">Memory 🃏</span>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg">Level {level+1}/3</span>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        {levelDone ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold mb-4">Level {level+1} geschafft!</h2>
            <button onClick={advanceLevel}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600">
              {level+1 >= sizes.length ? 'Fertig! 🏆' : `Level ${level+2} →`}
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-gray-600 mb-4">
              Finde alle <strong>gleichen Paare</strong>! ({sizes[level]/2} Paare)
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {cards.map(card => {
                const isFlipped = flipped.includes(card.uid)
                const isMatched = matched.has(card.pairId)
                const showFace = isFlipped || isMatched
                return (
                  <button key={card.uid} onClick={() => handleCardClick(card)} disabled={isMatched || locked}
                    className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition font-bold ${
                      !showFace ? 'bg-indigo-500 text-white hover:bg-indigo-600' :
                      isMatched ? 'bg-green-100 border-2 border-green-400' :
                      'bg-white border-2 border-blue-300'
                    }`}>
                    {showFace ? card.emoji : <Icon emoji="🃏" size={28} color="#fff" />}
                  </button>
                )
              })}
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              {moves} Versuche · {matched.size}/{cards.length/2} Paare
            </p>
          </>
        )}
      </div>
    </div>
  )
}
