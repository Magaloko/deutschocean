// src/pages/app/games/mathe/EinmaleinsBlitz.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { tables: [2, 5, 10], rounds: 8, missionId: 'einmaleinsBlitz-1', label: '2er, 5er, 10er' },
  2: { tables: [2, 3, 4, 5], rounds: 8, missionId: 'einmaleinsBlitz-2', label: '2er bis 5er' },
  3: { tables: [6, 7, 8, 9], rounds: 8, missionId: 'einmaleinsBlitz-3', label: '6er bis 9er' },
}

function buildRounds(level, cfg) {
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const a = cfg.tables[i % cfg.tables.length]
    const b = randInt(1, 10)
    const answer = a * b
    const dotPattern = answer <= 50           // show dot grid for smaller products
    const options = generateOptions(answer, Math.max(1, answer - 10), answer + 10)
    rounds.push({ a, b, answer, dotPattern, options })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, fontSize: '2.2rem', fontWeight: 900, marginBottom: 12,
      }}>
        <span style={{ color: '#1e293b' }}>{round.a}</span>
        <span style={{ color: '#ef4444' }}>×</span>
        <span style={{ color: '#1e293b' }}>{round.b}</span>
        <span style={{ color: '#94a3b8' }}>=</span>
        <span style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#fef2f2', border: '3px solid #ef4444',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', color: '#dc2626',
        }}>?</span>
      </div>
      {round.dotPattern && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${round.b}, 1fr)`,
          gap: 4,
          justifyItems: 'center',
          maxWidth: 240,
          margin: '0 auto',
        }}>
          {Array.from({ length: round.a * round.b }, (_, i) => (
            <span key={i} style={{
              width: 18, height: 18, borderRadius: '50%',
              background: i < round.a ? '#ef4444' : '#fecaca',
              display: 'block',
            }} />
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
      speakQuestion={(r) => `${r.a} mal ${r.b} ist?`}
    />
  )
}
