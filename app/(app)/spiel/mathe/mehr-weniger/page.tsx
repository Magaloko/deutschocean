'use client'
import MathGameEngine, { type GameConfig, type LevelConfig, type Round } from '@/components/game/MathGameEngine'
import { randInt } from '@/lib/game/mathUtils'

const config: GameConfig = {
  1: { min: 1, max: 10, rounds: 8, missionId: 'mehrWeniger-1', label: 'Zahlen 1–10' },
  2: { min: 1, max: 20, rounds: 8, missionId: 'mehrWeniger-2', label: 'Zahlen 1–20' },
  3: { min: 5, max: 50, rounds: 8, missionId: 'mehrWeniger-3', label: 'Zahlen bis 50' },
}

interface MRound extends Round { left: number; right: number }

function buildRounds(_level: number, cfg: LevelConfig): MRound[] {
  const min = cfg.min as number, max = cfg.max as number
  const rounds: MRound[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    const type = i < 3 ? 'gt' : i < 6 ? 'lt' : 'eq'
    const left = randInt(min, max)
    let right: number
    if (type === 'eq') right = left
    else if (type === 'gt') right = randInt(min, Math.max(min, left - 1))
    else right = randInt(Math.min(left + 1, max), max)
    const answer = left > right ? '>' : left < right ? '<' : '='
    rounds.push({ left, right, options: ['>', '<', '='], answer })
  }
  return rounds
}

function renderQuestion(round: Round) {
  const r = round as MRound
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
          {Array.from({ length: Math.min(r.left, 20) }, (_, i) => (
            <span key={i} className={r.left > 15 ? 'text-base' : 'text-xl'}>🔵</span>
          ))}
          {r.left > 20 && <span className="text-xs text-gray-500">+{r.left - 20}</span>}
        </div>
        <div className="font-extrabold text-2xl mt-2">{r.left}</div>
      </div>
      <div className="text-4xl text-gray-400 font-extrabold">?</div>
      <div className="text-center">
        <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
          {Array.from({ length: Math.min(r.right, 20) }, (_, i) => (
            <span key={i} className={r.right > 15 ? 'text-base' : 'text-xl'}>🟠</span>
          ))}
          {r.right > 20 && <span className="text-xs text-gray-500">+{r.right - 20}</span>}
        </div>
        <div className="font-extrabold text-2xl mt-2">{r.right}</div>
      </div>
    </div>
  )
}

export default function MehrWeniger() {
  return (
    <MathGameEngine
      gameTitle="Mehr oder Weniger ⚖️"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(round: Round) => {
        const r = round as MRound
        return `Ist ${r.left} größer, kleiner oder gleich ${r.right}?`
      }}
    />
  )
}
