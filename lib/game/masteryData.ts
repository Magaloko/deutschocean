import { MISSIONS } from './gameData'
import { WELTEN, type Welt } from './weltenData'

export interface Rank {
  id:           string
  label:        string
  icon:         string
  color:        string
  minPlays:     number
  maxWeakRatio: number
}

export interface WeltMastery {
  rank:          Rank
  nextRank:      Rank | null
  progress:      number   // 0.0–1.0
  plays:         number
  weakRatio:     number
  totalMissions: number
}

export const RANKS: Rank[] = [
  { id:'neuling',   label:'Neuling',   icon:'🌱', color:'#94a3b8', minPlays:0,  maxWeakRatio:1.0  },
  { id:'anfaenger', label:'Anfänger',  icon:'📚', color:'#0ea5e9', minPlays:3,  maxWeakRatio:0.6  },
  { id:'lehrling',  label:'Lehrling',  icon:'🎓', color:'#8b5cf6', minPlays:8,  maxWeakRatio:0.4  },
  { id:'profi',     label:'Profi',     icon:'🏆', color:'#f59e0b', minPlays:16, maxWeakRatio:0.25 },
  { id:'meister',   label:'Meister',   icon:'👑', color:'#ef4444', minPlays:28, maxWeakRatio:0.15 },
]

interface Profile {
  completedMissions?: string[]
  weakGames?:         Record<string, number>
}

export function getWeltMastery(welt: Welt, profile: Profile | null): WeltMastery {
  const completed   = profile?.completedMissions ?? []
  const weakGames   = profile?.weakGames ?? {}
  const weltTypes   = new Set(welt.gameTypes)
  const weltMissions = MISSIONS.filter(m => weltTypes.has(m.type))
  const totalMissions = weltMissions.length

  let plays = 0, weakCount = 0
  for (const m of weltMissions) {
    if (completed.includes(m.id)) plays++
    if ((weakGames[m.id] ?? 0) >= 1) weakCount++
  }
  const weakRatio = plays > 0 ? weakCount / plays : 0

  let currentRank = RANKS[0]
  for (const r of RANKS) {
    if (plays >= r.minPlays && weakRatio <= r.maxWeakRatio) currentRank = r
  }
  const currentIdx = RANKS.indexOf(currentRank)
  const nextRank   = RANKS[currentIdx + 1] ?? null

  let progress = 1
  if (nextRank) {
    const needed = nextRank.minPlays - currentRank.minPlays
    const gained = Math.min(plays - currentRank.minPlays, needed)
    progress = needed > 0 ? Math.max(0, gained / needed) : 0
  }

  return { rank: currentRank, nextRank, progress, plays, weakRatio, totalMissions }
}

export function getOverallMastery(profile: Profile | null) {
  if (!profile) return { rank: RANKS[0], plays: 0, weakRatio: 0, weltCount: 0 }
  const masteries = WELTEN.map(w => getWeltMastery(w, profile))
  const plays     = masteries.reduce((s, m) => s + m.plays, 0)
  const weakCount = masteries.reduce((s, m) => s + m.weakRatio * m.plays, 0)
  const weakRatio = plays > 0 ? weakCount / plays : 0

  let rank = RANKS[0]
  for (const r of RANKS) {
    if (plays >= r.minPlays && weakRatio <= r.maxWeakRatio) rank = r
  }
  return { rank, plays, weakRatio, weltCount: masteries.filter(m => m.plays > 0).length }
}
