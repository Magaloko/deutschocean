import type { Rank } from '@/lib/game/masteryData'
import ProgressBar from './ProgressBar'

interface MasteryBadgeProps { rank: Rank; nextRank?: Rank | null; progress?: number; size?: 'sm' | 'md' | 'lg' }

const sizes = { sm:'text-sm', md:'text-base', lg:'text-lg' }

export default function MasteryBadge({ rank, nextRank, progress, size = 'md' }: MasteryBadgeProps) {
  return (
    <div className={`flex flex-col gap-1 ${sizes[size]}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{rank.icon}</span>
        <span className="font-semibold" style={{ color: rank.color }}>{rank.label}</span>
      </div>
      {nextRank && progress !== undefined && (
        <div className="mt-1">
          <ProgressBar value={progress * 100} max={100} color="primary" label={`→ ${nextRank.label}`} />
        </div>
      )}
      {!nextRank && <span className="text-xs text-gray-400">Höchster Rang 👑</span>}
    </div>
  )
}
