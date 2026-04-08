import { useState, useCallback, useRef, useEffect } from 'react'

const CORRECT_MESSAGES = [
  'Super! 🌟',
  'Toll gemacht!',
  'Richtig! 👏',
  'Weiter so!',
  'Klasse!',
]

const WRONG_MESSAGES = [
  'Fast! Nochmal!',
  'Nicht ganz…',
  'Probier es nochmal!',
  'Du schaffst das!',
]

const CELEBRATE_MESSAGES = [
  'Fantastisch! 🎉',
  'Alle geschafft! 🏆',
  'Du bist ein Star! ⭐',
]

const LEVEL_UP_MESSAGES = [
  'Du wirst immer besser! 🚀',
  'Toll, jetzt kommt die Herausforderung! ⭐',
  'Super Fortschritt! 💪',
]

const LEVEL_DOWN_MESSAGES = [
  'Kein Stress, wir üben weiter! 😊',
  'Schritt für Schritt! 🐾',
  'Du schaffst das — einfachere Aufgaben! 🌟',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Steuert Ozzy's Stimmung und Sprechblase.
 * Kehrt nach 2 Sekunden automatisch zu 'idle' zurück.
 */
export function useOzzy() {
  const [mood, setMood]       = useState('idle')
  const [message, setMessage] = useState(null)
  const timerRef = useRef(null)

  const react = useCallback((event) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    switch (event) {
      case 'correct':
        setMood('correct')
        setMessage(pick(CORRECT_MESSAGES))
        break
      case 'wrong':
        setMood('wrong')
        setMessage(pick(WRONG_MESSAGES))
        break
      case 'celebrate':
        setMood('celebrate')
        setMessage(pick(CELEBRATE_MESSAGES))
        break
      case 'thinking':
        setMood('thinking')
        setMessage('Hmm… 🤔')
        break
      case 'levelUp':
        setMood('levelUp')
        setMessage(pick(LEVEL_UP_MESSAGES))
        break
      case 'levelDown':
        setMood('levelDown')
        setMessage(pick(LEVEL_DOWN_MESSAGES))
        break
      default:
        setMood('idle')
        setMessage(null)
    }
    // Auto-reset to idle after 2s (except celebrate which stays 3s)
    const delay = event === 'celebrate' ? 3000 : 2000
    timerRef.current = setTimeout(() => {
      setMood('idle')
      setMessage(null)
    }, delay)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { mood, message, react }
}
