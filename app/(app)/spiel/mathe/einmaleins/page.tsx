'use client'
import MathGameEngine, { type GameConfig, type LevelConfig, type Round } from '@/components/game/MathGameEngine'
import { randInt, generateOptions } from '@/lib/game/mathUtils'

const config: GameConfig = {
  1: { tables: [2,5,10], rounds: 8, missionId: 'einmaleinsBlitz-1', label: '2er, 5er, 10er' },
  2: { tables: [2,3,4,5], rounds: 8, missionId: 'einmaleinsBlitz-2', label: '2er bis 5er' },
  3: { tables: [6,7,8,9], rounds: 8, missionId: 'einmaleinsBlitz-3', label: '6er bis 9er' },
}

interface ERound extends Round { a: number; b: number; dotPattern: boolean }

function buildRounds(_level: number, cfg: LevelConfig): ERound[] {
  const tables = cfg.tables as number[]
  const rounds: ERound[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    const a = tables[i % tables.length]
    const b = randInt(1, 10)
    const answer = a * b
    rounds.push({
      a, b, answer, dotPattern: answer <= 50,
      options: generateOptions(answer, Math.max(1, answer - 10), answer + 10),
    })
  }
  return rounds
}

function renderQuestion(round: Round) {
  const r = round as ERound
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 text-4xl font-extrabold mb-3">
        <span>{r.a}</span><span className="text-red-500">×</span><span>{r.b}</span>
        <span className="text-gray-400">=</span>
        <span className="w-[52px] h-[52px] rounded-full bg-red-50 border-2 border-red-400 flex items-center justify-center text-2xl text-red-600">?</span>
      </div>
      {r.dotPattern && (
        <div className="grid gap-1 justify-items-center max-w-[240px] mx-auto" style={{ gridTemplateColumns: `repeat(${r.b}, 1fr)` }}>
          {Array.from({ length: r.a * r.b }, (_, i) => (
            <span key={i} className={`w-[18px] h-[18px] rounded-full block ${i < r.a ? 'bg-red-500' : 'bg-red-200'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function EinmaleinsBlitz() {
  return (
    <MathGameEngine
      gameTitle="Einmaleins-Blitz ✖️"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(round: Round) => {
        const r = round as ERound
        return `${r.a} mal ${r.b} ist?`
      }}
    />
  )
}
