import React from 'react'
import Icon from './Icon.jsx'

// Rendert N Sterne als SVG (lucide Star) — ersetzt '⭐'.repeat(n) in Result-Screens.
// Unerfüllte Sterne (bis `max`) werden grau angezeigt, wenn `max` gesetzt ist.
export default function StarsRow({ count = 0, max, size = 18, color = '#f59e0b', dimColor = '#e5e7eb' }) {
  const total = max ?? count
  return (
    <span style={{ display: 'inline-flex', gap: '0.15rem' }}>
      {Array.from({ length: total }, (_, i) => (
        <Icon
          key={i}
          emoji="⭐"
          size={size}
          color={i < count ? color : dimColor}
        />
      ))}
    </span>
  )
}
