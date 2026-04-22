// src/hooks/useAdaptivity.js
//
// Prensky Kap. 10 ("Adaptivity in Games"): Games halten den Spieler
// kontinuierlich im "Flow-Zone" — zwischen zu schwer (Frust) und zu
// einfach (Langeweile). Traditionelle Engine hier: Stufen (easy/normal/
// hard). Refactor: zusätzlicher kontinuierlicher Float 0.0–1.0, der
// mit jeder Antwort sanft shiftet — für Games, die feinere Kontrolle
// wollen (z.B. Zeitlimit, Wort-Länge, Ablenker-Anzahl).
//
// Backward-Compat: `difficulty` (string) bleibt.
// NEU: `difficultyFloat` (0.0 = leicht, 1.0 = schwer).

import { useState, useCallback } from 'react'
import { getSessionDifficulty } from '../lib/adaptivityEngine.js'

// Wie stark jede Antwort den Float verändert.
// Richtig → −0.08 (kleinerer Schritt, Spieler bleibt gefordert)
// Falsch  → +0.15 (schnellere Erleichterung nach Fehlern)
// (Ja, richtig = NEGATIVER Schritt, weil niedrig = leichter.)
// Eigentlich: Float steigt bei vielen Richtigen (härter), fällt bei Fehlern.
const STEP_UP_ON_CORRECT = 0.08   // richtig → +
const STEP_DOWN_ON_WRONG = 0.15   // falsch → −

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v))
}

function floatToLabel(f) {
  if (f < 0.33) return 'easy'
  if (f < 0.67) return 'normal'
  return 'hard'
}

function labelToFloat(label) {
  return label === 'easy' ? 0.2 : label === 'hard' ? 0.8 : 0.5
}

export function useAdaptivity(initialDifficulty = 'normal') {
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [wrongStreak,  setWrongStreak]  = useState(0)
  const [difficulty,   setDifficulty]   = useState(initialDifficulty)
  const [difficultyFloat, setDifficultyFloat] = useState(labelToFloat(initialDifficulty))

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
    // Kontinuierlicher Float: schneller runter bei Fehler, langsamer rauf bei Erfolg.
    // Das gibt eine "Flow-Zone", die sich dynamisch an den Spieler anpasst —
    // ohne harte Sprünge zwischen den Stufen.
    setDifficultyFloat((prev) =>
      clamp(prev + (isCorrect ? STEP_UP_ON_CORRECT : -STEP_DOWN_ON_WRONG)),
    )
  }, [])

  const reset = useCallback(() => {
    setSessionStats({ correct: 0, total: 0 })
    setWrongStreak(0)
    setDifficulty(initialDifficulty)
    setDifficultyFloat(labelToFloat(initialDifficulty))
  }, [initialDifficulty])

  return {
    difficulty,          // string — backward-compat
    difficultyFloat,     // 0.0–1.0 — neue feine Skala
    floatToLabel,        // helper für Spiele, die String aus Float ableiten
    wrongCount: wrongStreak,
    recordAnswer,
    reset,
    sessionStats,
  }
}
