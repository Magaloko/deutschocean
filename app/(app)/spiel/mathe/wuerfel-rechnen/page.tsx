'use client'
import MathGameEngine, { type GameConfig, type LevelConfig, type Round } from '@/components/game/MathGameEngine'
import { randInt, generateOptions } from '@/lib/game/mathUtils'

const config: GameConfig = {
  1: { maxDie: 3, rounds: 8, missionId: 'wuerfelRechnen-1', label: 'Würfel 1–3' },
  2: { maxDie: 6, rounds: 8, missionId: 'wuerfelRechnen-2', label: 'Würfel 1–6' },
  3: { maxDie: 6, rounds: 8, missionId: 'wuerfelRechnen-3', label: 'Drei Würfel' },
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50,50]], 2: [[25,25],[75,75]], 3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]], 5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
}

function DiceFace({ value }: { value: number }) {
  return (
    <svg width="60" height="60" viewBox="0 0 100 100">
      <rect x="5" y="5" width="90" height="90" rx="18" fill="#fff" stroke="#e2e8f0" strokeWidth="4" />
      {DOT_POSITIONS[value].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="9" fill="#1e293b" />)}
    </svg>
  )
}

interface WRound extends Round { die1: number; die2: number; die3: number | null; dice: number }

function buildRounds(level: number, cfg: LevelConfig): WRound[] {
  const maxDie = cfg.maxDie as number
  const dice = level === 3 ? 3 : 2
  const rounds: WRound[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    const die1 = randInt(1, maxDie)
    const die2 = randInt(1, maxDie)
    const die3 = dice === 3 ? randInt(1, maxDie) : null
    const answer = die1 + die2 + (die3 ?? 0)
    const maxSum = dice * maxDie
    rounds.push({
      die1, die2, die3, dice, answer,
      options: generateOptions(answer, Math.max(dice, answer - 3), Math.min(maxSum, answer + 3)),
    })
  }
  return rounds
}

function renderQuestion(round: Round) {
  const r = round as WRound
  return (
    <div className="flex items-center justify-center gap-3">
      <DiceFace value={r.die1} />
      <span className="text-3xl font-extrabold text-emerald-500">+</span>
      <DiceFace value={r.die2} />
      {r.die3 !== null && (
        <>
          <span className="text-3xl font-extrabold text-emerald-500">+</span>
          <DiceFace value={r.die3} />
        </>
      )}
      <span className="text-3xl font-extrabold text-gray-400">=</span>
      <span className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-2xl font-extrabold text-emerald-700">?</span>
    </div>
  )
}

export default function WuerfelRechnen() {
  return (
    <MathGameEngine
      gameTitle="Würfel-Rechnen 🎲"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(round: Round) => {
        const r = round as WRound
        return `${r.die1} plus ${r.die2}${r.die3 ? ` plus ${r.die3}` : ''} ist?`
      }}
    />
  )
}
