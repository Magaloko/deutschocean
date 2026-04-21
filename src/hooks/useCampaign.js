// src/hooks/useCampaign.js
//
// Kampagnen-Logik: Fortschritt aus `profile.completedMissions` ableiten,
// Belohnung beim Abschluss vergeben.
// Persistenz: `profile.campaignProgress[campaignId].claimedAt` verhindert
// doppelte Belohnungen; `startedAt` markiert den Start.

import { useState, useCallback } from 'react'
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { useAuth } from './useAuth.jsx'

export function useCampaign() {
  const { profile } = useAuth()
  const [claiming, setClaiming] = useState(false)

  const startCampaign = useCallback(async (campaignId) => {
    if (!profile || !auth.currentUser) return
    const existing = profile.campaignProgress?.[campaignId]
    if (existing?.startedAt) return
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      [`campaignProgress.${campaignId}.startedAt`]: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }, [profile])

  const claimReward = useCallback(async (campaign) => {
    if (!profile || !auth.currentUser) return
    const already = profile.campaignProgress?.[campaign.id]?.claimedAt
    if (already) return
    setClaiming(true)
    try {
      const updates = {
        xp: increment(campaign.reward.xp),
        [`campaignProgress.${campaign.id}.claimedAt`]: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      if (campaign.reward.badgeId) {
        updates.unlockedBadges = arrayUnion(campaign.reward.badgeId)
      }
      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates)
    } finally {
      setClaiming(false)
    }
  }, [profile])

  return {
    campaignProgress: profile?.campaignProgress ?? {},
    startCampaign,
    claimReward,
    claiming,
  }
}
