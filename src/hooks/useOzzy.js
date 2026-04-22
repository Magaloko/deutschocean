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

const KOMBO_MESSAGES = [
  '3 in Folge! Du bist in Flow! 🔥',
  'Hattrick! Weiter so! ⚡',
  'Unaufhaltbar! 💫',
]

const STREAK_MESSAGES = [
  'Schon wieder da! 🔥',
  'Täglicher Profi! 🌟',
  'Deine Serie lebt! ✨',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Wie viele Richtige in Folge lösen einen Kombo-Feier aus?
// Feuer bei genau 3 und dann erneut bei 5, 7, 9, … — wiederkehrende
// Verstärkung, aber nicht spam-mäßig bei jedem Klick.
const KOMBO_STEPS = new Set([3, 5, 7, 9, 12, 15])

/**
 * Steuert Ozzy's Stimmung und Sprechblase.
 * Kehrt nach 2 Sekunden automatisch zu 'idle' zurück.
 *
 * Kombo-Logik ist hier zentralisiert: wenn `react('correct')` 3× in Folge
 * gefeuert wird, eskaliert Ozzy automatisch zu `kombo`. Bei `wrong` wird
 * der Zähler zurückgesetzt. Spiele müssen nichts weiter tun.
 */
export function useOzzy() {
  const [mood, setMood]       = useState('idle')
  const [message, setMessage] = useState(null)
  const timerRef  = useRef(null)
  const comboRef  = useRef(0)

  const react = useCallback((event) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    // Kombo-Zähler: bei correct hochzählen, bei wrong resetten.
    // Bei Schwellwert → Event zu `kombo` upgraden.
    if (event === 'correct') {
      comboRef.current += 1
      if (KOMBO_STEPS.has(comboRef.current)) {
        event = 'kombo'
      }
    } else if (event === 'wrong') {
      comboRef.current = 0
    }

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
      case 'kombo':
        setMood('celebrate')
        setMessage(pick(KOMBO_MESSAGES))
        break
      case 'streak':
        setMood('celebrate')
        setMessage(pick(STREAK_MESSAGES))
        break
      default:
        setMood('idle')
        setMessage(null)
    }
    // Auto-reset to idle after 2s (celebrate/kombo/streak stay longer)
    const delay = ['celebrate', 'kombo', 'streak'].includes(event) ? 3000 : 2000
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
