// src/pages/app/games/mathe/MinusRakete.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 1, max: 5,  rounds: 8, missionId: 'minusRakete-1', label: 'bis 10' },
  2: { min: 1, max: 10, rounds: 8, missionId: 'minusRakete-2', label: 'bis 20' },
  3: { min: 2, max: 20, rounds: 8, missionId: 'minusRakete-3', label: 'bis 50' },
}

function buildRounds(level, cfg) {
  const rounds = []
  const maxA = level === 1 ? 10 : level === 2 ? 20 : 50
  for (let i = 0; i < cfg.rounds; i++) {
    const b      = randInt(cfg.min, cfg.max)
    const answer = randInt(1, maxA - b)
    const a      = b + answer
    const options = generateOptions(answer, 1, Math.max(a - 1, answer + 3))
    rounds.push({
      a, b, options, answer,
      explanation: `Rechne rückwärts: von ${a} ausgehend ${b} Schritte zurück = ${answer}.`,
    })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 8 }}>🚀</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: '2rem', fontWeight: 900 }}>
        <span style={{ color: '#1e293b' }}>{round.a}</span>
        <span style={{ color: '#f97316' }}>−</span>
        <span style={{ color: '#1e293b' }}>{round.b}</span>
        <span style={{ color: '#94a3b8' }}>=</span>
        <span style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#fff7ed', border: '3px solid #fb923c',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', color: '#ea580c',
        }}>?</span>
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
      speakQuestion={(r) => `${r.a} minus ${r.b} ist?`}
    />
  )
}
