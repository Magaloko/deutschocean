// src/hooks/useProgress.jsx
import { useState } from 'react'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { useAuth } from './useAuth.jsx'
import { BADGES } from '../lib/gameData.js'

export function useProgress() {
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)

  async function completeSession({ missionId, xpEarned, stars }) {
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
  }
}
