// src/pages/app/games/mathe/MiniMarkt.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { shuffle, generateOptions } from '../../../../lib/mathUtils.js'

// All prices in Cent to avoid float arithmetic errors
const ITEMS = [
  { name: '🍎 Apfel',        price: 50  },
  { name: '🍌 Banane',       price: 30  },
  { name: '🥛 Milch',        price: 120 },
  { name: '🍞 Brot',         price: 180 },
  { name: '🧃 Saft',         price: 90  },
  { name: '🧀 Käse',         price: 150 },
  { name: '🥚 Ei',           price: 20  },
  { name: '🍫 Schokolade',   price: 110 },
  { name: '🍊 Orange',       price: 40  },
  { name: '🥕 Karotte',      price: 35  },
]

// Format Cent as "1,20 €"
function formatCent(cent) {
  return (cent / 100).toFixed(2).replace('.', ',') + ' €'
}

const config = {
  1: { itemCount: 2, rounds: 8, missionId: 'miniMarkt-1', label: '2 Artikel' },
  2: { itemCount: 3, rounds: 8, missionId: 'miniMarkt-2', label: '3 Artikel' },
  3: { itemCount: 4, rounds: 8, missionId: 'miniMarkt-3', label: '4 Artikel' },
}

function buildRounds(level, cfg) {
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const items  = shuffle(ITEMS).slice(0, cfg.itemCount)
    const answer = items.reduce((sum, item) => sum + item.price, 0)
    const spread = 20
    const options = generateOptions(answer, Math.max(10, answer - spread * 2), answer + spread * 2)
    rounds.push({ items, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ width: '100%' }}>
      {round.items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 4px',
          borderBottom: i < round.items.length - 1 ? '1px solid #e2e8f0' : 'none',
          fontSize: '0.95rem', fontWeight: 800,
        }}>
          <span>{item.name}</span>
          <span style={{ color: '#f59e0b', fontWeight: 900 }}>{formatCent(item.price)}</span>
        </div>
      ))}
      <div style={{
        marginTop: 10, paddingTop: 8, borderTop: '2px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between',
        fontSize: '1rem', fontWeight: 900, color: '#1e293b',
      }}>
        <span>Gesamt:</span>
        <span style={{ color: '#6366f1' }}>?</span>
      </div>
    </div>
  )
}

export default function MiniMarkt() {
  return (
    <MathGameEngine
      gameTitle="Mini-Markt 🛒"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={() => 'Was kostet alles zusammen?'}
      formatOption={formatCent}
    />
  )
}
