// SM-2 Algorithmus — Wozniak 1987
// Direkt portiert aus dem Original-JS mit vollen Typen

interface SM2State {
  interval: number
  easeFactor: number
  repetitions: number
}

interface SM2Result extends SM2State {
  nextDue: string  // ISO-Datum
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function sm2Next(accuracy: number, state?: SM2State): SM2Result {
  // Genauigkeit 0–1 auf SM-2 Qualität 0–5 mappen
  const q = Math.round(accuracy * 5)

  let { interval = 1, easeFactor = 2.5, repetitions = 0 } = state ?? {}

  if (q < 3) {
    // Fehler: zurücksetzen
    repetitions = 0
    interval = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else {
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }

    repetitions += 1
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextDue: q < 3 ? todayISO() : addDays(interval),
  }
}

export function isDue(nextDue: string): boolean {
  return nextDue <= todayISO()
}
