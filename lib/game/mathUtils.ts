export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateOptions(correct: number, min: number, max: number, count = 4): number[] {
  const opts = new Set<number>([correct])
  let attempts = 0
  const spread = Math.max(1, Math.round((max - min) / 4))
  while (opts.size < count && attempts < 100) {
    attempts++
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? 1 : -1)
    const candidate = correct + delta
    if (candidate >= min && candidate <= max + spread && candidate !== correct) {
      opts.add(candidate)
    }
  }
  let fill = correct + 1
  while (opts.size < count) {
    if (fill !== correct) opts.add(fill)
    fill++
    if (fill > correct + count * 2) break
  }
  return shuffle([...opts])
}
