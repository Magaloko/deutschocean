'use client'
import React from 'react'
import MathGameEngine, { type GameConfig, type LevelConfig, type Round } from '@/components/game/MathGameEngine'
import { randInt, generateOptions } from '@/lib/game/mathUtils'

const config: GameConfig = {
  1: { min: 0, max: 20,  rounds: 8, missionId: 'zahlenfolge-1', label: '+1 oder +2' },
  2: { min: 0, max: 50,  rounds: 8, missionId: 'zahlenfolge-2', label: '+2, +5, +10' },
  3: { min: 0, max: 100, rounds: 8, missionId: 'zahlenfolge-3', label: '+3, +5, +10' },
}

const STEPS: Record<number, number[]> = { 1:[1,2], 2:[2,5,10], 3:[3,5,10] }

interface ZRound extends Round { sequence: (number|null)[]; gapIdx: number; step: number }

function buildRounds(level: number, cfg: LevelConfig): ZRound[] {
  const min = cfg.min as number, max = cfg.max as number
  const steps = STEPS[level]
  const seqLen = 5
  const rounds: ZRound[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    const step  = steps[i % steps.length]
    const start = randInt(min, max - step * (seqLen - 1))
    const seq   = Array.from({ length: seqLen }, (_, k) => start + k * step)
    const gapIdx = randInt(1, seqLen - 2)
    const answer = seq[gapIdx]
    rounds.push({
      sequence: seq.map((n, k) => (k === gapIdx ? null : n)),
      gapIdx, step, answer,
      options: generateOptions(answer, Math.max(0, answer - step * 2), answer + step * 2),
    })
  }
  return rounds
}

function renderQuestion(round: Round) {
  const r = round as ZRound
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {r.sequence.map((n, i) => (
        <React.Fragment key={i}>
          <div className={`min-w-[44px] h-11 rounded-xl flex items-center justify-center font-extrabold border-2 px-2 ${
            n === null ? 'bg-violet-500 text-white border-violet-600 shadow-lg text-xl' : 'bg-violet-100 text-violet-800 border-violet-200'
          }`}>{n === null ? '?' : n}</div>
          {i < r.sequence.length - 1 && <span className="text-gray-400 font-bold">→</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Zahlenfolge() {
  return (
    <MathGameEngine
      gameTitle="Zahlenfolge 🔗"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={() => 'Welche Zahl fehlt in der Folge?'}
    />
  )
}
