'use client'
import { useState, useCallback } from 'react'
import { getHintLevel, shouldOfferHint, type Difficulty } from '@/lib/learning/adaptivityEngine'
import { speak } from '@/lib/game/sounds'

export interface Hint {
  text: string
  tts:  boolean
}

export interface HintsMap {
  long:   Hint
  medium: Hint
  short:  Hint
}

export function useHints(hintsMap: HintsMap, difficulty: Difficulty, wrongCount: number) {
  const [hint,           setHint]           = useState<Hint | null>(null)
  const [hintsUsedCount, setHintsUsedCount] = useState(0)

  const showHint = useCallback(() => {
    if (!shouldOfferHint(difficulty, wrongCount)) return
    const level = getHintLevel(difficulty)
    const h = hintsMap[level]
    if (!h) return
    setHint(h)
    setHintsUsedCount(n => n + 1)
    if (h.tts) speak(h.text)
  }, [hintsMap, difficulty, wrongCount])

  const dismissHint = useCallback(() => setHint(null), [])

  return { hint, showHint, dismissHint, hintsUsedCount }
}
