import React from 'react'
import Icon from '../ui/Icon.jsx'
import styles from './StrategyPicker.module.css'

// Vor jeder Session wählt der Spieler seinen Modus.
//
// Inspiriert von Prensky Kap. 7 ("Interesting Decisions every 0.5s") und
// Kap. 10 ("Playing Against Type"): Das Kind trifft eine bewusste Wahl
// über den eigenen Lernstil — Express (Risiko/Geschwindigkeit),
// Normal (Standard), oder Trainer (mehr Hilfe, weniger XP).
//
// Games benutzen das via useStrategy() Hook.

export const STRATEGIES = [
  {
    id: 'express',
    label: 'Express',
    emoji: '⚡',
    color: '#ef4444',
    xpMultiplier: 2.0,
    hintsAllowed: false,
    timeLimit: true,
    desc: 'Doppelt XP — keine Tipps!',
    tagline: 'Für schnelle Profis',
  },
  {
    id: 'normal',
    label: 'Normal',
    emoji: '🎯',
    color: '#4f46e5',
    xpMultiplier: 1.0,
    hintsAllowed: true,
    timeLimit: false,
    desc: 'Ausgewogen',
    tagline: 'Der Standard-Modus',
  },
  {
    id: 'trainer',
    label: 'Trainer',
    emoji: '🎓',
    color: '#10b981',
    xpMultiplier: 0.5,
    hintsAllowed: true,
    timeLimit: false,
    extraHelp: true,
    desc: 'Ozzy hilft aktiv',
    tagline: 'Zum Lernen ohne Druck',
  },
]

export function getStrategyById(id) {
  return STRATEGIES.find((s) => s.id === id) ?? STRATEGIES[1]
}

export default function StrategyPicker({ onSelect, gameTitle }) {
  return (
    <div className={`${styles.picker} fade-in`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{gameTitle}</h2>
        <p className={styles.sub}>Wie willst du spielen?</p>
      </div>

      <div className={styles.grid}>
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.card}
            style={{ '--c': s.color }}
            onClick={() => onSelect(s)}
          >
            <div className={styles.cardIcon}>
              <Icon emoji={s.emoji} size={40} color={s.color} />
            </div>
            <div className={styles.cardLabel}>{s.label}</div>
            <div className={styles.cardTagline}>{s.tagline}</div>
            <div className={styles.cardMeta}>
              <span className={styles.cardXp}>{s.xpMultiplier === 1 ? '1× XP' : s.xpMultiplier === 2 ? '2× XP' : '½ XP'}</span>
              <span className={styles.cardDesc}>{s.desc}</span>
            </div>
          </button>
        ))}
      </div>

      <p className={styles.footNote}>Du kannst jederzeit den Modus wechseln.</p>
    </div>
  )
}
