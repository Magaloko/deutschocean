// src/lib/spacedRepetition.js
// =============================================
// Vereinfachter SM-2 Algorithmus
// Basiert auf: Wozniak 1987 (SuperMemo 2)
// =============================================

function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Berechnet das nächste Review-Datum und den neuen Intervall.
 *
 * @param {object} current — aktueller SM-2-Status für diese Mission
 * @param {number} score   — Ergebnis 0–1 (z.B. 4/5 richtig = 0.8)
 * @returns {{ interval: number, easeFactor: number, repetitions: number, nextReview: string }}
 */
export function sm2Next(current, score) {
  const {
    interval    = 1,
    easeFactor  = 2.5,
    repetitions = 0,
  } = current ?? {}

  // SM-2 quality: 0–5 scale (we map 0–1 score to 3–5)
  // score < 0.6 → quality 2 (below threshold) → reset
  // score >= 0.6 → quality 3–5 based on accuracy
  const quality = score < 0.6 ? 2 : Math.round(2 + score * 3)

  let newInterval
  let newRepetitions
  let newEaseFactor

  if (quality < 3) {
    // Failed — reset to beginning
    newInterval    = 1
    newRepetitions = 0
    newEaseFactor  = Math.max(1.3, easeFactor - 0.2)
  } else {
    // Passed
    newRepetitions = repetitions + 1
    if (newRepetitions === 1)      newInterval = 1
    else if (newRepetitions === 2) newInterval = 6
    else                           newInterval = Math.round(interval * easeFactor)

    // Update ease factor: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  }

  // Next review date: today + interval days
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + newInterval)
  const nextReview = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`

  return {
    interval:    newInterval,
    easeFactor:  Math.round(newEaseFactor * 100) / 100,  // round to 2 decimals
    repetitions: newRepetitions,
    nextReview,
  }
}

/**
 * Gibt true zurück wenn diese Mission heute fällig ist.
 * @param {string|null} nextReview — "YYYY-MM-DD" or null
 */
export function isDueToday(nextReview) {
  if (!nextReview) return false
  const today = todayLocal()
  return nextReview <= today
}
