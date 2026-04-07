// src/pages/app/games/mathe/Zahlenstrahl.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 1,  max: 10, rounds: 8, missionId: 'zahlenstrahl-1', label: 'Zahlen 1–10' },
  2: { min: 1,  max: 20, rounds: 8, missionId: 'zahlenstrahl-2', label: 'Zahlen 1–20' },
  3: { min: 5,  max: 50, rounds: 8, missionId: 'zahlenstrahl-3', label: 'Zahlen bis 50' },
}

function buildRounds(level, cfg) {
  const seqLen = level === 1 ? 5 : level === 2 ? 6 : 7
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const start = randInt(cfg.min, cfg.max - seqLen + 1)
    const seq   = Array.from({ length: seqLen }, (_, k) => start + k)
    const gapIdx = randInt(1, seqLen - 2)           // never first or last
    const answer = seq[gapIdx]
    const sequence = seq.map((n, k) => (k === gapIdx ? null : n))
    const options  = generateOptions(answer, Math.max(cfg.min, answer - 4), Math.min(cfg.max, answer + 4))
    rounds.push({ sequence, gapIdx, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
      {round.sequence.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: n === null ? '#6366f1' : '#e0e7ff',
            color: n === null ? '#fff' : '#3730a3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: n === null ? '1.3rem' : '1rem',
            border: n === null ? '3px solid #4f46e5' : '2px solid #c7d2fe',
            boxShadow: n === null ? '0 2px 8px rgba(99,102,241,0.4)' : 'none',
          }}>
            {n === null ? '?' : n}
          </div>
          {i < round.sequence.length - 1 && (
            <span style={{ color: '#94a3b8', fontWeight: 900, fontSize: '1.1rem' }}>→</span>
          )}
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
