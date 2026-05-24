// Sound-System – Web Audio API, kein Download nötig.

type OscType = OscillatorType

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, startTime: number, duration: number, type: OscType = 'sine', vol = 0.22) {
  const c = getCtx()
  if (!c) return
  const osc  = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  gain.gain.setValueAtTime(vol, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
}

export function playCorrect() {
  const c = getCtx(); if (!c) return; const t = c.currentTime
  tone(523, t, 0.08); tone(659, t + 0.1, 0.08); tone(784, t + 0.2, 0.15)
}

export function playWrong() {
  const c = getCtx(); if (!c) return; const t = c.currentTime
  tone(280, t, 0.1, 'sawtooth', 0.2); tone(200, t + 0.11, 0.18, 'sawtooth', 0.2)
}

export function playCoin() {
  const c = getCtx(); if (!c) return; const t = c.currentTime
  tone(880, t, 0.06); tone(1108, t + 0.07, 0.1)
}

export function playComplete() {
  const c = getCtx(); if (!c) return; const t = c.currentTime
  tone(523, t, 0.08); tone(659, t + 0.1, 0.08)
  tone(784, t + 0.2, 0.08); tone(1047, t + 0.32, 0.35)
}

export function playFanfare() {
  const c = getCtx(); if (!c) return; const t = c.currentTime
  tone(523, t, 0.1, 'triangle'); tone(659, t + 0.12, 0.1, 'triangle')
  tone(784, t + 0.24, 0.1, 'triangle'); tone(1047, t + 0.36, 0.15, 'triangle')
  tone(784, t + 0.6, 0.1, 'triangle'); tone(1047, t + 0.72, 0.1, 'triangle')
  tone(1319, t + 0.84, 0.1, 'triangle'); tone(1568, t + 0.96, 0.5, 'triangle')
  tone(523, t + 0.96, 0.5, 'sine', 0.12); tone(659, t + 0.96, 0.5, 'sine', 0.12)
}

export function playStreak() {
  const c = getCtx(); if (!c) return; const t = c.currentTime
  tone(659, t, 0.08); tone(988, t + 0.08, 0.08)
  tone(1175, t + 0.16, 0.08); tone(1568, t + 0.26, 0.2)
}

export function playUnlock() {
  const c = getCtx(); if (!c) return; const t = c.currentTime
  tone(440, t, 0.08, 'triangle'); tone(659, t + 0.09, 0.08, 'triangle')
  tone(880, t + 0.18, 0.08, 'triangle'); tone(1175, t + 0.28, 0.22, 'triangle')
}

type GameType = 'nomen' | 'silben' | 'buchstaben' | 'anagramm' | 'satz' | 'fehler' | 'farben' | 'tier' | 'general'

const FEEDBACK_HINTS: Record<GameType, string[]> = {
  nomen:      ['Nomen sind immer großgeschrieben!', 'Nomen sind Personen, Tiere, Dinge oder Orte.', 'Großbuchstabe am Anfang? Dann ist es ein Nomen!'],
  silben:     ['Klatsche das Wort in Silben!', 'Jede Silbe hat einen Vokal: A, E, I, O oder U.', 'Sprich das Wort langsam — jede Silbe ist ein kleiner Beat.'],
  buchstaben: ['Hör nochmal genau hin — welcher Buchstabe klingt so?', 'Sprich den Laut laut aus und schau, welcher Buchstabe passt.'],
  anagramm:   ['Schau auf die Buchstaben — kannst du ein Wort erkennen?', 'Leg die Buchstaben der Reihe nach hin!', 'Probiere eine andere Reihenfolge!'],
  satz:       ['Das Verb steht meistens an zweiter Stelle im Satz.', 'Wer oder was macht etwas? Das ist das Subjekt.', 'Achte auf die Reihenfolge: Subjekt, Verb, dann der Rest.'],
  fehler:     ['Lies den Satz laut vor — klingt etwas komisch?', 'Schau auf Groß- und Kleinschreibung!', 'Lies den Satz noch einmal ganz langsam!'],
  farben:     ['Schau nochmal genau — welche Farbe ist das wirklich?', 'Welche Farbe siehst du? Schau nochmal hin!'],
  tier:       ['Hör dem Geräusch nochmal zu!', 'Welches Tier macht dieses Geräusch? Denk nach!'],
  general:    ['Fast! Probier es nochmal.', 'Nicht ganz — schau nochmal genau hin!', 'Du schaffst das! Nochmal versuchen.'],
}

export function speakFeedback(gameType: GameType) {
  const hints = FEEDBACK_HINTS[gameType] ?? FEEDBACK_HINTS.general
  speak(hints[Math.floor(Math.random() * hints.length)])
}

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang  = 'de-DE'
  utt.rate  = 0.82
  utt.pitch = 1.1
  window.speechSynthesis.speak(utt)
}
