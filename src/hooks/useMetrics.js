// useMetrics — Per-Player-Profiling nach Prensky Kap. 10
// ("As they play, we can quickly ascertain the players' reading speed,
// playing style, risk profile - pretty much everything about them.").
//
// Dieser Hook sammelt Session-weite Metriken:
//   - answerSpeedMs   : durchschnittliche Antwortzeit pro Entscheidung
//   - hintsPerSession : wie oft Tipps angefordert
//   - riskProfile     : leitet sich aus Strategy-Modus + Antwortzeit ab
//
// Games rufen `startTimer()` vor jeder Entscheidung und `stopTimer()`
// nach der Antwort. Am Ende liefert `getProfile()` das Player-Profil,
// das als Hint für Prensky's "Playing Against Type" dient.

import { useRef, useCallback } from 'react'

export function useMetrics() {
  const startTimeRef = useRef(null)
  const answerTimesMs = useRef([])
  const hintsShown = useRef(0)

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const stopTimer = useCallback(() => {
    if (!startTimeRef.current) return null
    const elapsed = Date.now() - startTimeRef.current
    answerTimesMs.current.push(elapsed)
    startTimeRef.current = null
    return elapsed
  }, [])

  const noteHintShown = useCallback(() => {
    hintsShown.current += 1
  }, [])

  const reset = useCallback(() => {
    startTimeRef.current = null
    answerTimesMs.current = []
    hintsShown.current = 0
  }, [])

  // Liefert das Profil. Spielt Prensky: wenn Kind schnell & risikofreudig
  // (wenige Tipps), neige zu "thorough"-Challenges. Wenn langsam &
  // vorsichtig, neige zu "speed"-Challenges.
  const getProfile = useCallback(() => {
    const times = answerTimesMs.current
    if (times.length === 0) {
      return { answerSpeedMs: null, hintsPerSession: 0, riskProfile: 'unknown' }
    }
    const avg = times.reduce((s, t) => s + t, 0) / times.length
    let riskProfile = 'balanced'
    if (avg < 3000 && hintsShown.current === 0)      riskProfile = 'fast-risk-taker'
    else if (avg > 10000 && hintsShown.current >= 2) riskProfile = 'cautious-learner'
    else if (avg < 5000)                             riskProfile = 'confident'
    else if (hintsShown.current >= 3)                riskProfile = 'help-seeker'

    return {
      answerSpeedMs: Math.round(avg),
      hintsPerSession: hintsShown.current,
      riskProfile,
      sampleCount: times.length,
    }
  }, [])

  return { startTimer, stopTimer, noteHintShown, reset, getProfile }
}

// Liefert eine menschen-lesbare Beschreibung des Risikoprofils —
// für Debriefing-Screen als "So spielst du"-Hinweis.
export function describeRiskProfile(profile) {
  if (!profile) return null
  switch (profile.riskProfile) {
    case 'fast-risk-taker':
      return 'Du bist mutig und schnell! Nächstes Mal: Express-Modus probieren?'
    case 'cautious-learner':
      return 'Du nimmst dir Zeit und nutzt Tipps — so lernt man gründlich. Schön!'
    case 'confident':
      return 'Du bist sicher und zügig. Das ist der Sweet-Spot.'
    case 'help-seeker':
      return 'Du nutzt oft Tipps — das ist clever. Beim nächsten Mal vielleicht einen ohne probieren?'
    case 'balanced':
      return 'Ausgewogener Stil — denken + entscheiden im richtigen Tempo.'
    default:
      return null
  }
}
