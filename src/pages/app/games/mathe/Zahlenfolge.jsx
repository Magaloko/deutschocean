// src/pages/app/games/mathe/Zahlenfolge.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 0, max: 20,  rounds: 8, missionId: 'zahlenfolge-1', label: '+1 oder +2' },
  2: { min: 0, max: 50,  rounds: 8, missionId: 'zahlenfolge-2', label: '+2, +5, +10' },
  3: { min: 0, max: 100, rounds: 8, missionId: 'zahlenfolge-3', label: '+3, +5, +10' },
}

const STEPS_BY_LEVEL = {
  1: [1, 2],
  2: [2, 5, 10],
  3: [3, 5, 10],
}

function buildRounds(level, cfg) {
  const steps = STEPS_BY_LEVEL[level]
  const seqLen = 5
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const step  = steps[i % steps.length]
    const start = randInt(cfg.min, cfg.max - step * (seqLen - 1))
    const seq   = Array.from({ length: seqLen }, (_, k) => start + k * step)
    const gapIdx = randInt(1, seqLen - 2)
    const answer = seq[gapIdx]
    const sequence = seq.map((n, k) => (k === gapIdx ? null : n))
    const options  = generateOptions(answer, Math.max(0, answer - step * 2), answer + step * 2)
    rounds.push({ sequence, gapIdx, step, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
      {round.sequence.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{
            minWidth: 44, height: 44, borderRadius: 12,
            background: n === null ? '#8b5cf6' : '#ede9fe',
            color: n === null ? '#fff' : '#5b21b6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: n === null ? '1.3rem' : '1rem',
            border: n === null ? '3px solid #7c3aed' : '2px solid #ddd6fe',
            padding: '0 8px',
            boxShadow: n === null ? '0 2px 8px rgba(139,92,246,0.4)' : 'none',
          }}>
            {n === null ? '?' : n}
          </div>
          {i < round.sequence.length - 1 && (
            <span style={{ color: '#94a3b8', fontWeight: 900 }}>→</span>
          )}
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
