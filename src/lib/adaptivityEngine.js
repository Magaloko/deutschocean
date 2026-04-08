// src/lib/adaptivityEngine.js

/**
 * Berechnet Schwierigkeitsstufe aus Session-Statistiken.
 * Benötigt mindestens 3 Versuche für eine Aussage.
 *
 * @param {{ correct: number, total: number }} stats
 * @returns {'easy' | 'normal' | 'hard'}
 */
export function getSessionDifficulty({ correct, total }) {
  if (total < 3) return 'normal'
  const errorRate = (total - correct) / total
  if (errorRate > 0.6) return 'easy'
  if (errorRate < 0.3 && total >= 5) return 'hard'
  return 'normal'
}

/**
 * Entscheidet ob ein Hint-Button angeboten werden soll.
 *
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @param {number} wrongCount - Anzahl Fehler in Folge
 * @returns {boolean}
 */
export function shouldOfferHint(difficulty, wrongCount) {
  if (difficulty === 'easy')   return wrongCount >= 1
  if (difficulty === 'normal') return wrongCount >= 2
  if (difficulty === 'hard')   return wrongCount >= 3
  return false
}

/**
 * Gibt den Hint-Tiefe-Level für die aktuelle Schwierigkeit zurück.
 *
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @returns {'long' | 'medium' | 'short'}
 */
export function getHintLevel(difficulty) {
  if (difficulty === 'easy') return 'long'
  if (difficulty === 'hard') return 'short'
  return 'medium'
}
