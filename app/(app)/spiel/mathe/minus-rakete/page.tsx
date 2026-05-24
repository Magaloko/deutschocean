'use client'
import MathGameEngine, { type GameConfig, type LevelConfig, type Round } from '@/components/game/MathGameEngine'
import { randInt, generateOptions } from '@/lib/game/mathUtils'

const config: GameConfig = {
  1: { min: 1, max: 5,  rounds: 8, missionId: 'minusRakete-1', label: 'bis 10' },
  2: { min: 1, max: 10, rounds: 8, missionId: 'minusRakete-2', label: 'bis 20' },
  3: { min: 2, max: 20, rounds: 8, missionId: 'minusRakete-3', label: 'bis 50' },
}

interface MRound extends Round { a: number; b: number }

function buildRounds(level: number, cfg: LevelConfig): MRound[] {
  const min = cfg.min as number, max = cfg.max as number
  const maxA = level === 1 ? 10 : level === 2 ? 20 : 50
  const rounds: MRound[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    const b = randInt(min, max)
    const answer = randInt(1, maxA - b)
    const a = b + answer
    rounds.push({
      a, b, answer,
      options: generateOptions(answer, 1, Math.max(a - 1, answer + 3)),
      explanation: `Rechne rückwärts: von ${a} ausgehend ${b} Schritte zurück = ${answer}.`,
    })
  }
  return rounds
}

function renderQuestion(round: Round) {
  const r = round as MRound
  return (
    <div className="text-center">
      <div className="text-5xl mb-2">🚀</div>
      <div className="flex items-center justify-center gap-3 text-3xl font-extrabold">
        <span>{r.a}</span><span className="text-orange-500">−</span><span>{r.b}</span>
        <span className="text-gray-400">=</span>
        <span className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-orange-50 border-2 border-orange-400 flex items-center justify-center text-2xl text-orange-600">?</span>
      </div>
    </div>
  )
}

export default function MinusRakete() {
  return (
    <MathGameEngine
      gameTitle="Minus-Rakete 🚀"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(round: Round) => {
        const r = round as MRound
        return `${r.a} minus ${r.b} ist?`
      }}
    />
  )
}
