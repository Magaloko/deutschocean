// useStrategy — State-Management für die Strategie-Wahl vor einer Session.
// Zentralisiert Prensky-Prinzip: "Interesting Decisions every 0.5s" +
// "Playing Against Type" (Kap. 10) — Spieler wählt bewusst Express /
// Normal / Trainer-Modus, und das Spiel adaptiert (XP-Multiplikator,
// Hinweise an/aus, Zeitlimit).
//
// Nutzungspattern:
//   const { strategy, pickStrategy, resetStrategy } = useStrategy()
//   if (!strategy) return <StrategyPicker onSelect={pickStrategy} gameTitle="Nomen-Jäger" />
//
//   // Im handleFinish:
//   await completeSession({ xpEarned: Math.round(baseXP * strategy.xpMultiplier), ... })

import { useState, useCallback } from 'react'
import { getStrategyById } from '../components/game/StrategyPicker.jsx'

export function useStrategy(defaultId = null) {
  const [strategy, setStrategy] = useState(defaultId ? getStrategyById(defaultId) : null)

  const pickStrategy = useCallback((s) => {
    setStrategy(typeof s === 'string' ? getStrategyById(s) : s)
  }, [])

  const resetStrategy = useCallback(() => setStrategy(null), [])

  return { strategy, pickStrategy, resetStrategy }
}
