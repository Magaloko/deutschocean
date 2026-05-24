'use client'
import { useState, useCallback, useRef, useEffect } from 'react'

export type OzzyMood = 'idle' | 'correct' | 'wrong' | 'celebrate' | 'thinking' | 'levelUp' | 'levelDown'
export type OzzyEvent = OzzyMood | 'kombo' | 'streak'

const MSGS: Record<string, string[]> = {
  correct:   ['Super! 🌟','Toll gemacht!','Richtig! 👏','Weiter so!','Klasse!'],
  wrong:     ['Fast! Nochmal!','Nicht ganz…','Probier es nochmal!','Du schaffst das!'],
  celebrate: ['Fantastisch! 🎉','Alle geschafft! 🏆','Du bist ein Star! ⭐'],
  levelUp:   ['Du wirst immer besser! 🚀','Toll, jetzt kommt die Herausforderung! ⭐','Super Fortschritt! 💪'],
  levelDown: ['Kein Stress, wir üben weiter! 😊','Schritt für Schritt! 🐾','Du schaffst das — einfachere Aufgaben! 🌟'],
  kombo:     ['3 in Folge! Du bist in Flow! 🔥','Hattrick! Weiter so! ⚡','Unaufhaltbar! 💫'],
  streak:    ['Schon wieder da! 🔥','Täglicher Profi! 🌟','Deine Serie lebt! ✨'],
}

const KOMBO_STEPS = new Set([3, 5, 7, 9, 12, 15])

function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }

export function useOzzy() {
  const [mood,    setMood]    = useState<OzzyMood>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const comboRef = useRef(0)

  const react = useCallback((event: OzzyEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    let ev = event
    if (ev === 'correct') {
      comboRef.current += 1
      if (KOMBO_STEPS.has(comboRef.current)) ev = 'kombo'
    } else if (ev === 'wrong') {
      comboRef.current = 0
    }

    switch (ev) {
      case 'correct':   setMood('correct');   setMessage(pick(MSGS.correct));   break
      case 'wrong':     setMood('wrong');     setMessage(pick(MSGS.wrong));     break
      case 'celebrate': setMood('celebrate'); setMessage(pick(MSGS.celebrate)); break
      case 'thinking':  setMood('thinking');  setMessage('Hmm… 🤔');            break
      case 'levelUp':   setMood('levelUp');   setMessage(pick(MSGS.levelUp));   break
      case 'levelDown': setMood('levelDown'); setMessage(pick(MSGS.levelDown)); break
      case 'kombo':     setMood('celebrate'); setMessage(pick(MSGS.kombo));     break
      case 'streak':    setMood('celebrate'); setMessage(pick(MSGS.streak));    break
      default:          setMood('idle');      setMessage(null)
    }

    const delay = ['celebrate','kombo','streak'].includes(ev) ? 3000 : 2000
    timerRef.current = setTimeout(() => { setMood('idle'); setMessage(null) }, delay)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return { mood, message, react }
}
