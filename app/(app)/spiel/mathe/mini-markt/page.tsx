'use client'
import MathGameEngine, { type GameConfig, type LevelConfig, type Round } from '@/components/game/MathGameEngine'
import { shuffle, generateOptions } from '@/lib/game/mathUtils'

interface Item { name: string; price: number }

const ITEMS: Item[] = [
  { name:'🍎 Apfel', price:50 }, { name:'🍌 Banane', price:30 }, { name:'🥛 Milch', price:120 },
  { name:'🍞 Brot', price:180 }, { name:'🧃 Saft', price:90 }, { name:'🧀 Käse', price:150 },
  { name:'🥚 Ei', price:20 }, { name:'🍫 Schokolade', price:110 }, { name:'🍊 Orange', price:40 },
  { name:'🥕 Karotte', price:35 },
]

function formatCent(cent: number | string): string {
  return (Number(cent) / 100).toFixed(2).replace('.', ',') + ' €'
}

const config: GameConfig = {
  1: { itemCount: 2, rounds: 8, missionId: 'miniMarkt-1', label: '2 Artikel' },
  2: { itemCount: 3, rounds: 8, missionId: 'miniMarkt-2', label: '3 Artikel' },
  3: { itemCount: 4, rounds: 8, missionId: 'miniMarkt-3', label: '4 Artikel' },
}

interface MRound extends Round { items: Item[] }

function buildRounds(_level: number, cfg: LevelConfig): MRound[] {
  const itemCount = cfg.itemCount as number
  const rounds: MRound[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    const items = shuffle(ITEMS).slice(0, itemCount)
    const answer = items.reduce((sum, it) => sum + it.price, 0)
    rounds.push({
      items, answer,
      options: generateOptions(answer, Math.max(10, answer - 40), answer + 40),
    })
  }
  return rounds
}

function renderQuestion(round: Round) {
  const r = round as MRound
  return (
    <div className="w-full">
      {r.items.map((item, i) => (
        <div key={i} className={`flex justify-between items-center py-2 px-1 text-sm font-bold ${i < r.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
          <span>{item.name}</span>
          <span className="text-yellow-600 font-extrabold">{formatCent(item.price)}</span>
        </div>
      ))}
      <div className="mt-3 pt-2 border-t-2 border-gray-200 flex justify-between font-extrabold">
        <span>Gesamt:</span><span className="text-indigo-600">?</span>
      </div>
    </div>
  )
}

export default function MiniMarkt() {
  return (
    <MathGameEngine
      gameTitle="Mini-Markt 🛒"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={() => 'Was kostet alles zusammen?'}
      formatOption={formatCent}
    />
  )
}
