'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameSession } from '@/hooks/useGameSession'
import { playCorrect, playWrong, playComplete, speak } from '@/lib/game/sounds'
import { randInt, generateOptions, shuffle } from '@/lib/game/mathUtils'
import Icon from '@/components/ui/Icon'
import StarsRow from '@/components/ui/StarsRow'

interface Fruit { emoji: string; name: string }
const FRUITS: Fruit[] = [
  { emoji:'🍎', name:'Äpfel' },{ emoji:'🍌', name:'Bananen' },{ emoji:'🍊', name:'Orangen' },
  { emoji:'🍓', name:'Erdbeeren' },{ emoji:'🍇', name:'Trauben' },{ emoji:'🍉', name:'Wassermelonen' },
  { emoji:'🍑', name:'Pfirsiche' },{ emoji:'🍒', name:'Kirschen' },{ emoji:'🥝', name:'Kiwis' },
  { emoji:'🍋', name:'Zitronen' },{ emoji:'🫐', name:'Blaubeeren' },{ emoji:'🍍', name:'Ananas' },
  { emoji:'🥭', name:'Mangos' },{ emoji:'🍐', name:'Birnen' },{ emoji:'🍈', name:'Melonen' },
]

const LEVEL_CONFIG = {
  1: { min:1, max:5,  rounds:8, missionId:'fruechtZaehlen-1', label:'Zahlen 1–5'  },
  2: { min:3, max:12, rounds:8, missionId:'fruechtZaehlen-2', label:'Zahlen 3–12' },
  3: { min:8, max:20, rounds:8, missionId:'fruechtZaehlen-3', label:'Zahlen 8–20' },
}

interface Round { fruit: Fruit; count: number; options: number[] }

function buildRounds(level: 1|2|3): Round[] {
  const cfg = LEVEL_CONFIG[level]
  const used = new Set<string>()
  const rounds: Round[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    let avail = FRUITS.filter(f => !used.has(f.emoji))
    if (!avail.length) { used.clear(); avail = FRUITS }
    const fruit = avail[randInt(0, avail.length - 1)]
    used.add(fruit.emoji)
    const count = randInt(cfg.min, cfg.max)
    rounds.push({ fruit, count, options: generateOptions(count, cfg.min, cfg.max) })
  }
  return rounds
}

function calcStars(score: number, total: number) {
  if (score === total) return 3
  if (score >= Math.ceil(total * 0.7)) return 2
  return 1
}

export default function FruechtZaehlen() {
  const router = useRouter()
  const { completeSession, saving } = useGameSession()
  const [level,setLevel]=useState<1|2|3|null>(null)
  const [rounds,setRounds]=useState<Round[]>([])
  const [idx,setIdx]=useState(0)
  const [selected,setSelected]=useState<number|null>(null)
  const [score,setScore]=useState(0)
  const [phase,setPhase]=useState<'playing'|'result'>('playing')

  const cfg = level ? LEVEL_CONFIG[level] : null
  const round = rounds[idx]
  const TOTAL = rounds.length

  useEffect(() => {
    if (phase === 'playing' && round) speak(`Wie viele ${round.fruit.name} siehst du?`)
  }, [round, phase])

  function startLevel(lvl: 1|2|3) {
    setLevel(lvl); setRounds(buildRounds(lvl))
    setIdx(0); setSelected(null); setScore(0); setPhase('playing')
  }

  function handleSelect(opt: number) {
    if (selected !== null) return
    setSelected(opt)
    if (opt === round.count) { playCorrect(); setScore(s=>s+1) } else playWrong()
  }

  async function handleWeiter() {
    if (idx + 1 >= TOTAL) {
      playComplete(); setPhase('result')
      await completeSession({ missionId: cfg!.missionId, xpEarned: score*2+5, stars: calcStars(score, TOTAL), correct: score, total: TOTAL })
    } else { setIdx(i=>i+1); setSelected(null) }
  }

  if (!level) return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100">←</button>
        <h1 className="text-2xl font-bold">Früchte Zählen 🍎</h1>
      </div>
      <p className="text-gray-500 mb-4">Zähle die Früchte und tippe die richtige Zahl!</p>
      <div className="flex flex-col gap-3">
        {([1,2,3] as const).map(lvl => (
          <button key={lvl} onClick={() => startLevel(lvl)}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-pink-300 hover:shadow-md transition">
            <StarsRow count={lvl} size={20} />
            <div className="flex-1 mx-4 text-left">
              <p className="font-semibold">Level {lvl}</p>
              <p className="text-sm text-gray-500">{LEVEL_CONFIG[lvl].label}</p>
            </div>
            <span className="text-gray-400 text-xl">›</span>
          </button>
        ))}
      </div>
    </div>
  )

  if (phase === 'result') {
    const stars = calcStars(score, TOTAL)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm w-full">
          <Icon emoji={stars === 3 ? '🏆' : '⭐'} size={64} color={stars === 3 ? '#ca8a04' : '#fbbf24'} />
          <h2 className="text-2xl font-bold mt-3 mb-1">{stars === 3 ? 'Perfekt gezählt!' : 'Super gemacht!'}</h2>
          <p className="text-gray-500 mb-4">{score} von {TOTAL} richtig</p>
          <div className="flex justify-center mb-6"><StarsRow count={stars} max={3} size={28} /></div>
          <div className="flex gap-3">
            <button onClick={() => startLevel(level)} disabled={saving}
              className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-50">Nochmal</button>
            <button onClick={() => router.push('/dashboard')}
              className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200">Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  const isLarge = round.count > 12
  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setLevel(null)} className="p-2 rounded-xl hover:bg-gray-100"><Icon emoji="←" size={18}/></button>
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1"><Icon emoji="🍎" size={14}/> Level {level}</span>
        <button onClick={() => speak(`Wie viele ${round.fruit.name} siehst du?`)} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Vorlesen"><Icon emoji="🔊" size={18}/></button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-pink-500 h-2 rounded-full transition-all" style={{ width:`${(idx/TOTAL)*100}%` }}/></div>
        <span className="text-xs text-gray-500">{idx+1}/{TOTAL}</span>
      </div>

      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${selected !== null ? (selected === round.count ? 'animate-bounce' : 'animate-pulse') : ''}`}>
        <div className={`flex flex-wrap justify-center ${isLarge ? 'gap-1 text-xl' : 'gap-2 text-3xl'}`}>
          {Array.from({ length: round.count }, (_, i) => <span key={i}>{round.fruit.emoji}</span>)}
        </div>
      </div>

      <p className="text-center text-lg font-semibold">
        Wie viele <strong>{round.fruit.name}</strong> siehst du?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map(opt => (
          <button key={opt} onClick={() => handleSelect(opt)} disabled={selected !== null}
            className={`py-4 rounded-2xl text-2xl font-bold border-2 transition ${
              selected === null ? 'bg-white border-gray-200 hover:border-pink-400' :
              opt === round.count ? 'bg-green-100 border-green-500 text-green-800' :
              opt === selected ? 'bg-red-100 border-red-500 text-red-800' :
              'bg-white border-gray-100 text-gray-400'
            }`}>{opt}</button>
        ))}
      </div>

      {selected !== null && (
        <div className="flex flex-col gap-3">
          <div className={`flex items-center gap-2 p-3 rounded-xl font-medium ${selected === round.count ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <Icon emoji={selected === round.count ? '✅' : '❌'} size={20}/>
            <span>{selected === round.count ? `Richtig! Es sind ${round.count} ${round.fruit.name}.` : `Es sind ${round.count} ${round.fruit.name}!`}</span>
          </div>
          <button onClick={handleWeiter} className="w-full py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600">
            {idx + 1 >= TOTAL ? '🏆 Ergebnis ansehen' : 'Weiter →'}
          </button>
        </div>
      )}
    </div>
  )
}
