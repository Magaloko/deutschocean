'use client'
import { useState, useCallback } from 'react'
import { getSessionDifficulty, type Difficulty } from '@/lib/learning/adaptivityEngine'

const STEP_UP   = 0.08
const STEP_DOWN = 0.15

function clamp(v: number, min = 0, max = 1) { return Math.max(min, Math.min(max, v)) }

function floatToLabel(f: number): Difficulty {
  if (f < 0.33) return 'easy'
  if (f < 0.67) return 'normal'
  return 'hard'
}

function labelToFloat(l: Difficulty): number {
  return l === 'easy' ? 0.2 : l === 'hard' ? 0.8 : 0.5
}

export function useAdaptivity(initialDifficulty: Difficulty = 'normal') {
  const [sessionStats,    setSessionStats]    = useState({ correct: 0, total: 0 })
  const [wrongStreak,     setWrongStreak]     = useState(0)
  const [difficulty,      setDifficulty]      = useState<Difficulty>(initialDifficulty)
  const [difficultyFloat, setDifficultyFloat] = useState(labelToFloat(initialDifficulty))

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setSessionStats(prev => {
      const next = { correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }
      setDifficulty(getSessionDifficulty(next))
      return next
    })
    setWrongStreak(prev => isCorrect ? 0 : prev + 1)
    setDifficultyFloat(prev => clamp(prev + (isCorrect ? STEP_UP : -STEP_DOWN)))
  }, [])

  const reset = useCallback(() => {
    setSessionStats({ correct: 0, total: 0 })
    setWrongStreak(0)
    setDifficulty(initialDifficulty)
    setDifficultyFloat(labelToFloat(initialDifficulty))
  }, [initialDifficulty])

  return { difficulty, difficultyFloat, floatToLabel, wrongCount: wrongStreak, recordAnswer, reset, sessionStats }
}
