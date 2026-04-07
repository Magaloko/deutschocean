// src/pages/app/games/mathe/WuerfelRechnen.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { maxDie: 3, rounds: 8, missionId: 'wuerfelRechnen-1', label: 'Würfel 1–3' },
  2: { maxDie: 6, rounds: 8, missionId: 'wuerfelRechnen-2', label: 'Würfel 1–6' },
  3: { maxDie: 6, rounds: 8, missionId: 'wuerfelRechnen-3', label: 'Drei Würfel' },
}

// SVG dot positions for standard die faces 1–6
const DOT_POSITIONS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

function DiceFace({ value }) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1]
  return (
    <svg width="60" height="60" viewBox="0 0 100 100">
      <rect x="5" y="5" width="90" height="90" rx="18" fill="#fff" stroke="#e2e8f0" strokeWidth="4" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#1e293b" />
      ))}
    </svg>
  )
}

function buildRounds(level, cfg) {
  const rounds = []
  const dice = level === 3 ? 3 : 2
  for (let i = 0; i < cfg.rounds; i++) {
    const die1 = randInt(1, cfg.maxDie)
    const die2 = randInt(1, cfg.maxDie)
    const die3 = dice === 3 ? randInt(1, cfg.maxDie) : null
    const answer = die1 + die2 + (die3 ?? 0)
    const maxSum = dice * cfg.maxDie
    const options = generateOptions(answer, Math.max(dice, answer - 3), Math.min(maxSum, answer + 3))
    rounds.push({ die1, die2, die3, dice, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <DiceFace value={round.die1} />
      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>+</span>
      <DiceFace value={round.die2} />
      {round.die3 !== null && (
        <>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>+</span>
          <DiceFace value={round.die3} />
        </>
      )}
      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#94a3b8' }}>=</span>
      <span style={{
        width: 52, height: 52, borderRadius: '50%',
        background: '#f0fdf4', border: '3px solid #22c55e',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', fontWeight: 900, color: '#16a34a',
      }}>?</span>
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
      speakQuestion={(r) => `${r.die1} plus ${r.die2}${r.die3 ? ` plus ${r.die3}` : ''} ist?`}
    />
  )
}
