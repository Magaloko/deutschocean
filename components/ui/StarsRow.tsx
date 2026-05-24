import Icon from './Icon'

interface StarsRowProps { count?: number; max?: number; size?: number; color?: string; dimColor?: string }

export default function StarsRow({ count = 0, max, size = 18, color = '#f59e0b', dimColor = '#e5e7eb' }: StarsRowProps) {
  const total = max ?? count
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <Icon key={i} emoji="⭐" size={size} color={i < count ? color : dimColor} />
      ))}
    </span>
  )
}
