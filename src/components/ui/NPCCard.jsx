import React, { useMemo } from 'react'
import Icon from './Icon.jsx'
import styles from './NPCCard.module.css'

// NPC-Card — Prensky Kap. 10, "Embedded Knowledge":
// Jede Welt hat einen eigenen Tutor mit Persönlichkeit und kontextuellen
// Sprüchen. Macht die Welt lebendig — nicht nur ein Spiele-Ordner,
// sondern ein Ort mit Charakter.
//
// Props:
//   npc:     { name, emoji, role, greeting, quotes[] }
//   color:   CSS-Farbe der Welt (für Akzent)
//   variant: 'greeting' (zeigt greeting) | 'quote' (zufälliger quote)
export default function NPCCard({ npc, color = '#4f46e5', variant = 'greeting' }) {
  const message = useMemo(() => {
    if (!npc) return ''
    if (variant === 'greeting') return npc.greeting
    const quotes = npc.quotes ?? []
    if (quotes.length === 0) return npc.greeting
    return quotes[Math.floor(Math.random() * quotes.length)]
  }, [npc, variant])

  if (!npc) return null

  return (
    <div className={styles.card} style={{ '--c': color }}>
      <div className={styles.avatar}>
        <Icon emoji={npc.emoji} size={38} />
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.name}>{npc.name}</span>
          <span className={styles.role}>{npc.role}</span>
        </div>
        <p className={styles.message}>„{message}"</p>
      </div>
    </div>
  )
}
