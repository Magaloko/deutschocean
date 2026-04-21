import React from 'react'
import { EMOJI_ICON_MAP, EMOJI_COLOR_HINT } from '../../lib/iconMap.js'

// <Icon emoji="🔍" size={20} />       → rendert lucide-Search SVG
// <Icon emoji="🍎" size={32} />       → kein Mapping vorhanden → rendert "🍎"
//                                        (Spiel-Content-Emojis bleiben erhalten)
// <Icon emoji="⭐" color="#fbbf24" /> → explizite Farbe überschreibt Hint
//
// Wichtig: Wenn du einen Content-Emoji (z. B. 🐶 in einem Memory-Spiel) NICHT
// als SVG haben willst, füge ihn einfach NICHT zur iconMap hinzu — Icon fällt
// automatisch auf das Emoji zurück.
export default function Icon({
  emoji,
  size = 20,
  color,
  strokeWidth = 2,
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}) {
  const LucideIcon = emoji ? EMOJI_ICON_MAP[emoji] : null

  if (!LucideIcon) {
    return (
      <span
        className={className}
        style={{ fontSize: size, lineHeight: 1, ...style }}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
        {...rest}
      >
        {emoji}
      </span>
    )
  }

  const resolvedColor = color ?? EMOJI_COLOR_HINT[emoji] ?? 'currentColor'

  return (
    <LucideIcon
      size={size}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      {...rest}
    />
  )
}
