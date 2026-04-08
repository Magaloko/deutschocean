// src/hooks/useProgress.jsx
import { useState } from 'react'
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { useAuth } from './useAuth.jsx'
import { BADGES } from '../lib/gameData.js'
import { sm2Next } from '../lib/spacedRepetition.js'

export function useProgress() {
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)

  async function completeSession({ missionId, xpEarned, stars, correct, total, hintsUsed = 0 }) {
    if (!profile || !auth.currentUser) return { newBadges: [] }
    setSaving(true)
    try {
      const newXP    = (profile.xp    ?? 0) + xpEarned
      const newStars = (profile.stars ?? 0) + stars
      const newBadges = BADGES
        .filter(b => !(profile.unlockedBadges ?? []).includes(b.id) && newXP >= b.xpRequired)
        .map(b => b.id)

      const updates = {
        xp:                newXP,
        stars:             newStars,
        completedMissions: arrayUnion(missionId),
        lastActiveDate:    new Date().toISOString(),
        updatedAt:         new Date().toISOString(),
      }
      if (newBadges.length) updates.unlockedBadges = arrayUnion(...newBadges)

      // Weakness tracking — uses atomic increment to avoid race conditions
      // Spaced Repetition (SM-2)
      if (typeof correct === 'number' && typeof total === 'number' && total > 0) {
        const accuracy = correct / total
        if (accuracy < 0.6) {
          updates[`weakGames.${missionId}`] = increment(1)
        } else if (accuracy === 1.0) {
          // Perfect score — reset the weakness counter for this game
          updates[`weakGames.${missionId}`] = 0
        }
        const currentSR = profile.spacedRepetition?.[missionId] ?? {}
        const nextSR = sm2Next(currentSR, accuracy)
        updates[`spacedRepetition.${missionId}`] = nextSR
      }

      // Hint usage tracking
      if (hintsUsed > 0) {
        updates.totalHintsUsed = increment(hintsUsed)
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates)
      return { newBadges }
    } finally {
      setSaving(false)
    }
  }

  return {
    completeSession,
    saving,
    completedMissions: profile?.completedMissions ?? [],
    weakGames:         profile?.weakGames         ?? {},
    spacedRepetition:  profile?.spacedRepetition  ?? {},
  }
}
