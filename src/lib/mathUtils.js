export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Generate `count` unique options including `correct`.
 * Stays within [min, max] when possible, fills sequentially if needed.
 */
export function generateOptions(correct, min, max, count = 4) {
  const opts = new Set([correct])
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
  // fill sequentially upward if still short
  let fill = correct + 1
  while (opts.size < count) {
    if (fill !== correct) opts.add(fill)
    fill++
    if (fill > correct + count * 2) break
  }
  return shuffle([...opts])
}
