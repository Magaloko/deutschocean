'use client'
import { useState, useCallback } from 'react'

export interface Strategy {
  id:          string
  label:       string
  description: string
  xpMultiplier: number
  hintsAllowed: boolean
  icon:        string
}

export const STRATEGIES: Strategy[] = [
  { id:'express', label:'Express',  icon:'⚡', xpMultiplier:2,   hintsAllowed:false, description:'2× XP, keine Hinweise — für Profis!' },
  { id:'normal',  label:'Normal',   icon:'📚', xpMultiplier:1,   hintsAllowed:true,  description:'Standard-Modus mit Hinweisen.' },
  { id:'trainer', label:'Trainer',  icon:'🐢', xpMultiplier:0.5, hintsAllowed:true,  description:'Mehr Hilfe, weniger Druck.' },
]

export function getStrategyById(id: string): Strategy | null {
  return STRATEGIES.find(s => s.id === id) ?? null
}

export function useStrategy(defaultId: string | null = null) {
  const [strategy, setStrategy] = useState<Strategy | null>(
    defaultId ? getStrategyById(defaultId) : null
  )

  const pickStrategy = useCallback((s: string | Strategy) => {
    setStrategy(typeof s === 'string' ? getStrategyById(s) : s)
  }, [])

  const resetStrategy = useCallback(() => setStrategy(null), [])

  return { strategy, pickStrategy, resetStrategy }
}
