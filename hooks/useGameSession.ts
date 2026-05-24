'use client'
// Ersetzt useProgress + useAuth für alle Spielseiten.
// Lädt Profil-Daten einmalig vom Server, schreibt Ergebnisse via POST /api/progress.

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { GameSessionResult, SpacedRepetitionItem, WeakGame } from '@/types'

interface ProfileData {
  completedMissions: string[]
  weakGames:         WeakGame[]
  spacedRepetition:  SpacedRepetitionItem[]
}

interface CompleteSessionOptions {
  missionId:    string
  xpEarned:     number
  stars:        number       // 1–3
  correct:      number
  total:        number
  hintsUsed?:   number
  answerSpeedMs?: number
  riskProfile?: string
}

export function useGameSession() {
  const { data: session } = useSession()
  const [profile,  setProfile]  = useState<ProfileData | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [newBadges, setNewBadges] = useState<string[]>([])

  // Profil beim Mount einmalig laden
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: ProfileData) => setProfile(data))
      .catch(console.error)
  }, [session?.user])

  const completeSession = useCallback(async (opts: CompleteSessionOptions) => {
    if (!session?.user) return { newBadges: [] }
    setSaving(true)
    try {
      const accuracy = opts.total > 0 ? opts.correct / opts.total : 0
      const body: GameSessionResult = {
        missionId:    opts.missionId,
        accuracy,
        xpEarned:     opts.xpEarned,
        starsEarned:  opts.stars,
        hintsUsed:    opts.hintsUsed ?? 0,
        answerSpeedMs: opts.answerSpeedMs,
        riskProfile:  opts.riskProfile as GameSessionResult['riskProfile'],
      }

      const res = await fetch('/api/progress', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Fehler beim Speichern')
      const result = await res.json() as { newBadges: string[] }

      // Lokalen State optimistisch aktualisieren
      setProfile(prev => {
        if (!prev) return prev
        return {
          ...prev,
          completedMissions: prev.completedMissions.includes(opts.missionId)
            ? prev.completedMissions
            : [...prev.completedMissions, opts.missionId],
          weakGames: accuracy < 0.6
            ? prev.weakGames.map(w =>
                w.missionId === opts.missionId ? { ...w, count: w.count + 1 } : w
              ).concat(prev.weakGames.some(w => w.missionId === opts.missionId)
                ? [] : [{ missionId: opts.missionId, count: 1 }])
            : prev.weakGames.map(w =>
                w.missionId === opts.missionId ? { ...w, count: 0 } : w
              ),
        }
      })

      setNewBadges(result.newBadges ?? [])
      return result
    } finally {
      setSaving(false)
    }
  }, [session?.user])

  return {
    completeSession,
    saving,
    newBadges,
    completedMissions: profile?.completedMissions ?? [],
    weakGames:         profile?.weakGames         ?? [],
    spacedRepetition:  profile?.spacedRepetition  ?? [],
    isReady: !!session?.user,
  }
}
