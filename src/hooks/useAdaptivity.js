// src/hooks/useAdaptivity.js
import { useState, useCallback } from 'react'
import { getSessionDifficulty } from '../lib/adaptivityEngine.js'

/**
 * Verfolgt Session-Statistiken und leitet adaptive Schwierigkeit ab.
 *
 * @param {'easy' | 'normal' | 'hard'} initialDifficulty
 *   Startschwierigkeit — aus weakGames abgeleitet:
 *   weakGames[missionId] > 0 → 'easy', sonst 'normal'
 *
 * @returns {{
 *   difficulty: 'easy' | 'normal' | 'hard',
 *   wrongCount: number,
 *   recordAnswer: (isCorrect: boolean) => void,
 *   reset: () => void,
 *   sessionStats: { correct: number, total: number },
 * }}
 */
export function useAdaptivity(initialDifficulty = 'normal') {
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [wrongStreak,  setWrongStreak]  = useState(0)
  const [difficulty,   setDifficulty]   = useState(initialDifficulty)

  const recordAnswer = useCallback((isCorrect) => {
    setSessionStats((prev) => {
      const next = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total:   prev.total + 1,
      }
      setDifficulty(getSessionDifficulty(next))
      return next
    })
    setWrongStreak((prev) => (isCorrect ? 0 : prev + 1))
  }, [])

  const reset = useCallback(() => {
    setSessionStats({ correct: 0, total: 0 })
    setWrongStreak(0)
    setDifficulty(initialDifficulty)
  }, [initialDifficulty])

  return { difficulty, wrongCount: wrongStreak, recordAnswer, reset, sessionStats }
}
