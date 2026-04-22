import React, { useMemo } from 'react'
import styles from './Confetti.module.css'

// Leichtgewichtige CSS-Confetti — keine Library. Erzeugt N Partikel,
// jedes mit zufälliger Start-Position, Farbe und Dauer. Animation läuft
// genau 1× (forwards) — Parent kann das Component einfach entfernen, um
// den Effekt zu beenden.
//
// Benutze innerhalb eines CelebrationOverlay oder nach einer Mission:
//   {showing && <Confetti count={80} />}
const COLORS = [
  '#f59e0b', '#ef4444', '#10b981', '#4f46e5', '#ec4899',
  '#8b5cf6', '#06b6d4', '#fbbf24', '#84cc16',
]

export default function Confetti({ count = 60, durationMs = 2600 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 400,
        duration: durationMs + Math.random() * 800,
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 120,
      })),
    [count, durationMs],
  )

  return (
    <div className={styles.container} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            background: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            '--rot': `${p.rotate}deg`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
