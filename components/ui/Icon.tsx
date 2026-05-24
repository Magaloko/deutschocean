'use client'
import { EMOJI_ICON_MAP, EMOJI_COLOR_HINT } from '@/lib/game/iconMap'
import type { LucideProps } from 'lucide-react'

interface IconProps {
  emoji: string
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

export default function Icon({ emoji, size = 20, color, strokeWidth = 2, className, style, 'aria-label': ariaLabel }: IconProps) {
  const map = EMOJI_ICON_MAP as Record<string, React.ComponentType<LucideProps> | undefined>
  const colorMap = EMOJI_COLOR_HINT as Record<string, string | undefined>
  const LucideIcon = emoji ? map[emoji] : undefined

  if (!LucideIcon) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}
        aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true}>
        {emoji}
      </span>
    )
  }

  const resolvedColor = color ?? colorMap[emoji] ?? 'currentColor'
  return (
    <LucideIcon size={size} color={resolvedColor} strokeWidth={strokeWidth}
      className={className} style={style}
      aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true} />
  )
}
