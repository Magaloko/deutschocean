// Skill-Mastery-System — inspiriert von Marc Prenskys "Leveling-Up-Gefühl"
// (Don't Bother Me Mom I'm Learning, Kap. 7).
//
// Kerngedanke: Das wichtigste Feature echter Spiele ist das GEFÜHL,
// besser zu werden. Wir berechnen pro Welt einen sichtbaren Rang
// basierend auf Anzahl gespielter Runden + Erfolgsquote.
//
// Ränge sind abgeleitet — sie werden NICHT persistiert. Basis:
//   profile.completedMissions (Anzahl pro Welt)
//   profile.weakGames          (Erfolgsquote-Indikator)
//   MISSIONS                   (Welt-Zuordnung)

import { MISSIONS } from './gameData.js'
import { WELTEN } from './weltenData.js'

// 5 Ränge mit klaren Schwellen. Jeder Rang braucht mehr gespielte
// Aufgaben UND gute Performance (wenige weakGames-Markierungen).
export const RANKS = [
  { id: 'neuling',    label: 'Neuling',      icon: '🌱', color: '#94a3b8', minPlays: 0,  maxWeakRatio: 1.0 },
  { id: 'anfaenger',  label: 'Anfänger',     icon: '📚', color: '#0ea5e9', minPlays: 3,  maxWeakRatio: 0.6 },
  { id: 'lehrling',   label: 'Lehrling',     icon: '🎓', color: '#8b5cf6', minPlays: 8,  maxWeakRatio: 0.4 },
  { id: 'profi',      label: 'Profi',        icon: '🏆', color: '#f59e0b', minPlays: 16, maxWeakRatio: 0.25 },
  { id: 'meister',    label: 'Meister',      icon: '👑', color: '#ef4444', minPlays: 28, maxWeakRatio: 0.15 },
]

// Berechne den Mastery-Rang für eine bestimmte Welt.
// Returns: { rank, nextRank, progress (0-1), plays, weakRatio, totalMissions }
export function getWeltMastery(welt, profile) {
  const completed  = profile?.completedMissions ?? []
  const weakGames  = profile?.weakGames ?? {}
  const weltTypes  = new Set(welt.gameTypes)

  // Zähle alle Missionen der Welt + wie viele gespielt + wie viele schwach
  const weltMissions = MISSIONS.filter((m) => weltTypes.has(m.type))
  const totalMissions = weltMissions.length

  let plays = 0
  let weakCount = 0
  for (const m of weltMissions) {
    if (completed.includes(m.id)) plays++
    if ((weakGames[m.id] ?? 0) >= 1) weakCount++
  }
  const weakRatio = plays > 0 ? weakCount / plays : 0

  // Finde höchsten erfüllten Rang
  let currentRank = RANKS[0]
  for (const r of RANKS) {
    if (plays >= r.minPlays && weakRatio <= r.maxWeakRatio) {
      currentRank = r
    }
  }
  const currentIdx = RANKS.indexOf(currentRank)
  const nextRank   = RANKS[currentIdx + 1] ?? null

  // Fortschritt bis zum nächsten Rang (0.0–1.0)
  let progress = 1
  if (nextRank) {
    const needed = nextRank.minPlays - currentRank.minPlays
    const gained = Math.min(plays - currentRank.minPlays, needed)
    progress = needed > 0 ? Math.max(0, gained / needed) : 0
  }

  return { rank: currentRank, nextRank, progress, plays, weakRatio, totalMissions }
}

// Aggregierter Rang über ALLE Welten (für Profilseite).
// Nimmt den höchsten erreichten Rang aus allen Welten.
export function getOverallMastery(profile) {
  if (!profile) return { rank: RANKS[0], weltCount: 0 }
  const masteries = WELTEN.map((w) => getWeltMastery(w, profile))
  const plays     = masteries.reduce((s, m) => s + m.plays, 0)
  const weakCount = masteries.reduce((s, m) => s + m.weakRatio * m.plays, 0)
  const weakRatio = plays > 0 ? weakCount / plays : 0

  let rank = RANKS[0]
  for (const r of RANKS) {
    if (plays >= r.minPlays && weakRatio <= r.maxWeakRatio) rank = r
  }
  return { rank, plays, weakRatio, weltCount: masteries.filter((m) => m.plays > 0).length }
}
