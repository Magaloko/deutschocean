// src/hooks/useHints.js
import { useState, useCallback } from 'react'
import { getHintLevel, shouldOfferHint } from '../lib/adaptivityEngine.js'
import { speak } from '../lib/sounds.js'

/**
 * Verwaltet Hint-Anzeige für ein Spiel.
 * Wählt automatisch den richtigen Hint-Level (long/medium/short)
 * basierend auf aktueller Schwierigkeit.
 * Long-Hints lösen TTS (speak()) aus wenn hint.tts === true.
 *
 * @param {{ long: { text: string, tts: boolean }, medium: { text: string, tts: boolean }, short: { text: string, tts: boolean } }} hintsMap
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @param {number} wrongCount
 *
 * @returns {{
 *   hint: { text: string, tts: boolean } | null,
 *   showHint: () => void,
 *   dismissHint: () => void,
 *   hintsUsedCount: number,
 * }}
 */
export function useHints(hintsMap, difficulty, wrongCount) {
  const [hint, setHint]                     = useState(null)
  const [hintsUsedCount, setHintsUsedCount] = useState(0)

  const showHint = useCallback(() => {
    if (!shouldOfferHint(difficulty, wrongCount)) return
    const level = getHintLevel(difficulty)
    const h = hintsMap[level]
    if (!h) return
    setHint(h)
    setHintsUsedCount((n) => n + 1)
    if (h.tts) speak(h.text)
  }, [hintsMap, difficulty, wrongCount])

  const dismissHint = useCallback(() => setHint(null), [])

  return { hint, showHint, dismissHint, hintsUsedCount }
}
