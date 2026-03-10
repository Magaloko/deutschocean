import { useState } from 'react'
import { useAuth } from './useAuth.jsx'
import { BADGES } from '../lib/gameData.js'

export function useProgress() {
  const { profile, setProfile } = useAuth()
  const [saving, setSaving] = useState(false)

  async function completeSession({ missionId, xpEarned, stars }) {
    if (!profile) return { newBadges: [] }
    setSaving(true)

    try {
      const currentXP  = (profile.xp ?? 0) + xpEarned
      const newBadges  = BADGES.filter(
        (b) => !profile.unlockedBadges?.includes(b.id) && currentXP >= b.xpRequired
      ).map((b) => b.id)

      setProfile((prev) => ({
        ...prev,
        xp:                currentXP,
        stars:             (prev.stars ?? 0) + stars,
        lastActiveDate:    new Date().toISOString(),
        completedMissions: [...new Set([...(prev.completedMissions ?? []), missionId])],
        unlockedBadges:    [...new Set([...(prev.unlockedBadges ?? []), ...newBadges])],
      }))

      return { newBadges }
    } finally {
      setSaving(false)
    }
  }

  return { completeSession, saving, completedMissions: profile?.completedMissions ?? [] }
}
