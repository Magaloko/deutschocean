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
