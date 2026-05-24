'use client'
import React from 'react'
import MathGameEngine, { type GameConfig, type LevelConfig, type Round } from '@/components/game/MathGameEngine'
import { randInt, generateOptions } from '@/lib/game/mathUtils'

const config: GameConfig = {
  1: { min: 1, max: 10, rounds: 8, missionId: 'zahlenstrahl-1', label: 'Zahlen 1–10' },
  2: { min: 1, max: 20, rounds: 8, missionId: 'zahlenstrahl-2', label: 'Zahlen 1–20' },
  3: { min: 5, max: 50, rounds: 8, missionId: 'zahlenstrahl-3', label: 'Zahlen bis 50' },
}

interface ZRound extends Round { sequence: (number | null)[]; gapIdx: number }

function buildRounds(level: number, cfg: LevelConfig): ZRound[] {
  const min = cfg.min as number, max = cfg.max as number
  const seqLen = level === 1 ? 5 : level === 2 ? 6 : 7
  const rounds: ZRound[] = []
  for (let i = 0; i < cfg.rounds; i++) {
    const start = randInt(min, max - seqLen + 1)
    const seq = Array.from({ length: seqLen }, (_, k) => start + k)
    const gapIdx = randInt(1, seqLen - 2)
    const answer = seq[gapIdx]
    rounds.push({
      sequence: seq.map((n, k) => (k === gapIdx ? null : n)),
      gapIdx, answer,
      options: generateOptions(answer, Math.max(min, answer - 4), Math.min(max, answer + 4)),
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
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold border-2 transition ${
            n === null
              ? 'bg-indigo-500 text-white border-indigo-600 shadow-lg text-xl'
              : 'bg-indigo-100 text-indigo-800 border-indigo-200'
          }`}>
            {n === null ? '?' : n}
          </div>
          {i < r.sequence.length - 1 && <span className="text-gray-400 font-bold">→</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Zahlenstrahl() {
  return (
    <MathGameEngine
      gameTitle="Zahlenstrahl 🔢"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={() => 'Welche Zahl fehlt in der Reihe?'}
    />
  )
}
