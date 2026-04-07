// src/pages/app/games/mathe/MehrWeniger.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 1,  max: 10, rounds: 8, missionId: 'mehrWeniger-1', label: 'Zahlen 1–10' },
  2: { min: 1,  max: 20, rounds: 8, missionId: 'mehrWeniger-2', label: 'Zahlen 1–20' },
  3: { min: 5,  max: 50, rounds: 8, missionId: 'mehrWeniger-3', label: 'Zahlen bis 50' },
}

function buildRounds(level, cfg) {
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    // Distribute: 3 '>' rounds, 3 '<' rounds, 2 '=' rounds per 8
    const type = i < 3 ? 'gt' : i < 6 ? 'lt' : 'eq'
    const left = randInt(cfg.min, cfg.max)
    let right
    if (type === 'eq') right = left
    else if (type === 'gt') right = randInt(cfg.min, Math.max(cfg.min, left - 1))
    else right = randInt(Math.min(left + 1, cfg.max), cfg.max)
    const answer = left > right ? '>' : left < right ? '<' : '='
    rounds.push({ left, right, options: ['>', '<', '='], answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: 120 }}>
          {Array.from({ length: Math.min(round.left, 20) }, (_, i) => (
            <span key={i} style={{ fontSize: round.left > 15 ? '1rem' : '1.4rem' }}>🔵</span>
          ))}
          {round.left > 20 && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>+{round.left - 20}</span>}
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.5rem', marginTop: 6 }}>{round.left}</div>
      </div>
      <div style={{ fontSize: '2.5rem', color: '#94a3b8', fontWeight: 900 }}>?</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: 120 }}>
          {Array.from({ length: Math.min(round.right, 20) }, (_, i) => (
            <span key={i} style={{ fontSize: round.right > 15 ? '1rem' : '1.4rem' }}>🟠</span>
          ))}
          {round.right > 20 && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>+{round.right - 20}</span>}
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.5rem', marginTop: 6 }}>{round.right}</div>
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
      speakQuestion={(r) => `Ist ${r.left} größer, kleiner oder gleich ${r.right}?`}
    />
  )
}
