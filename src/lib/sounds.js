// =============================================
// Sound-System – erzeugt Töne via Web Audio API.
// Kein Download nötig, funktioniert in allen
// modernen Browsern.
// =============================================

let ctx = null

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      return null
    }
  }
  // Browser-Autoplay-Policy: Kontext ggf. fortsetzen
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, startTime, duration, type = 'sine', vol = 0.22) {
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

/** Aufsteigende 3-Ton-Fanfare für richtige Antwort */
export function playCorrect() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  tone(523,  t,        0.08)  // C5
  tone(659,  t + 0.1,  0.08)  // E5
  tone(784,  t + 0.2,  0.15)  // G5
}

/** Absteigender Buzz für falsche Antwort */
export function playWrong() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  tone(280, t,        0.1,  'sawtooth', 0.2)
  tone(200, t + 0.11, 0.18, 'sawtooth', 0.2)
}

/** Kleine Münzen-Melodie für Match-Events */
export function playCoin() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  tone(880,  t,        0.06)
  tone(1108, t + 0.07, 0.1)
}

const FEEDBACK_HINTS = {
  nomen: [
    'Nomen sind immer großgeschrieben! Schau nochmal genau hin.',
    'Nomen sind Personen, Tiere, Dinge oder Orte.',
    'Großbuchstabe am Anfang? Dann ist es ein Nomen!',
  ],
  silben: [
    'Klatsche das Wort in Silben! So findest du sie besser.',
    'Jede Silbe hat einen Vokal: A, E, I, O oder U.',
    'Sprich das Wort langsam — jede Silbe ist ein kleiner Beat.',
  ],
  // Für Phonik-/Hörspiele (BuchstabenChaos nutzt 'anagramm')
  buchstaben: [
    'Hör nochmal genau hin — welcher Buchstabe klingt so?',
    'Sprich den Laut laut aus und schau, welcher Buchstabe passt.',
  ],
  anagramm: [
    'Schau auf die Buchstaben — kannst du ein Wort erkennen?',
    'Leg die Buchstaben der Reihe nach hin!',
    'Probiere eine andere Reihenfolge!',
  ],
  satz: [
    'Das Verb steht meistens an zweiter Stelle im Satz.',
    'Wer oder was macht etwas? Das ist das Subjekt.',
    'Achte auf die Reihenfolge: Subjekt, Verb, dann der Rest.',
  ],
  fehler: [
    'Lies den Satz laut vor — klingt etwas komisch?',
    'Schau auf Groß- und Kleinschreibung!',
    'Lies den Satz noch einmal ganz langsam!',
  ],
  // Reserviert für FarbenJaeger + TierGeraeusche (noch nicht verdrahtet)
  farben: [
    'Schau nochmal genau — welche Farbe ist das wirklich?',
    'Welche Farbe siehst du? Schau nochmal hin!',
  ],
  tier: [
    'Hör dem Geräusch nochmal zu!',
    'Welches Tier macht dieses Geräusch? Denk nach!',
  ],
  general: [
    'Fast! Probier es nochmal.',
    'Nicht ganz — schau nochmal genau hin!',
    'Du schaffst das! Nochmal versuchen.',
  ],
}

/**
 * Spricht einen kurzen kontextuellen Hinweis nach einer falschen Antwort.
 * @param {string} gameType - z.B. 'nomen', 'silben', 'buchstaben', 'anagramm', 'satz', 'fehler', 'farben', 'tier'
 */
export function speakFeedback(gameType) {
  const hints = FEEDBACK_HINTS[gameType]
  if (!hints) return speak('Probier es nochmal!')

  const text = hints[Math.floor(Math.random() * hints.length)]
  speak(text)
}

/** Text-to-Speech auf Deutsch — für Kinder die noch nicht lesen können */
export function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'de-DE'
  utt.rate = 0.82
  utt.pitch = 1.1
  window.speechSynthesis.speak(utt)
}

/** Volle Sieges-Fanfare am Spielende */
export function playComplete() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  tone(523,  t,        0.08)
  tone(659,  t + 0.1,  0.08)
  tone(784,  t + 0.2,  0.08)
  tone(1047, t + 0.32, 0.35)  // C6 – hoher Abschluss-Ton
}

/** Große Fanfare für Kampagnen-Abschluss oder seltene Errungenschaften.
 *  Zwei aufsteigende Akkord-Läufe mit längerem Finale. */
export function playFanfare() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  // Erster Lauf
  tone(523,  t,        0.1,  'triangle')  // C5
  tone(659,  t + 0.12, 0.1,  'triangle')  // E5
  tone(784,  t + 0.24, 0.1,  'triangle')  // G5
  tone(1047, t + 0.36, 0.15, 'triangle')  // C6
  // Zweiter Lauf (höher)
  tone(784,  t + 0.6,  0.1,  'triangle')
  tone(1047, t + 0.72, 0.1,  'triangle')
  tone(1319, t + 0.84, 0.1,  'triangle')  // E6
  tone(1568, t + 0.96, 0.5,  'triangle')  // G6 — Finale
  // Akkord-Unterton zum Abschluss
  tone(523,  t + 0.96, 0.5,  'sine', 0.12)
  tone(659,  t + 0.96, 0.5,  'sine', 0.12)
}

/** Streak-Jingle: heller, fröhlicher 4-Ton-Lauf */
export function playStreak() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  tone(659,  t,        0.08)  // E5
  tone(988,  t + 0.08, 0.08)  // B5
  tone(1175, t + 0.16, 0.08)  // D6
  tone(1568, t + 0.26, 0.2)   // G6
}

/** Unlock-Sound: aufsteigendes „Schloss-öffnet"-Motiv */
export function playUnlock() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  tone(440,  t,        0.08, 'triangle')
  tone(659,  t + 0.09, 0.08, 'triangle')
  tone(880,  t + 0.18, 0.08, 'triangle')
  tone(1175, t + 0.28, 0.22, 'triangle')
}
