export type Difficulty = 'easy' | 'normal' | 'hard'
export type HintLevel  = 'long' | 'medium' | 'short'

export interface SessionStats {
  correct: number
  total:   number
}

export function getSessionDifficulty({ correct, total }: SessionStats): Difficulty {
  if (total < 3) return 'normal'
  const errorRate = (total - correct) / total
  if (errorRate > 0.6) return 'easy'
  if (errorRate < 0.3 && total >= 5) return 'hard'
  return 'normal'
}

export function shouldOfferHint(difficulty: Difficulty, wrongCount: number): boolean {
  if (difficulty === 'easy')   return wrongCount >= 1
  if (difficulty === 'normal') return wrongCount >= 2
  if (difficulty === 'hard')   return wrongCount >= 3
  return false
}

export function getHintLevel(difficulty: Difficulty): HintLevel {
  if (difficulty === 'easy') return 'long'
  if (difficulty === 'hard') return 'short'
  return 'medium'
}
