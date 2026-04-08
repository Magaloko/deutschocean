import { describe, it, expect } from 'vitest'
import {
  getSessionDifficulty,
  shouldOfferHint,
  getHintLevel,
} from './adaptivityEngine.js'

describe('getSessionDifficulty', () => {
  it('returns normal when total < 3 (not enough data)', () => {
    expect(getSessionDifficulty({ correct: 0, total: 0 })).toBe('normal')
    expect(getSessionDifficulty({ correct: 0, total: 2 })).toBe('normal')
  })

  it('returns easy when errorRate > 0.6 and total >= 3', () => {
    // 3/3 wrong = 100% error
    expect(getSessionDifficulty({ correct: 0, total: 3 })).toBe('easy')
    // 3/4 wrong = 75% error
    expect(getSessionDifficulty({ correct: 1, total: 4 })).toBe('easy')
  })

  it('returns hard when errorRate < 0.3 and total >= 5', () => {
    // 0/5 wrong = 0% error
    expect(getSessionDifficulty({ correct: 5, total: 5 })).toBe('hard')
    // 1/5 wrong = 20% error
    expect(getSessionDifficulty({ correct: 4, total: 5 })).toBe('hard')
  })

  it('returns normal for 4 total with 40% error rate (not enough for hard)', () => {
    // 40% error, but total < 5 → still normal
    expect(getSessionDifficulty({ correct: 3, total: 4 })).toBe('normal')
  })

  it('returns normal for borderline 60% error rate (not > 0.6)', () => {
    // exactly 60% error = NOT > 0.6
    expect(getSessionDifficulty({ correct: 2, total: 5 })).toBe('normal')
  })
})

describe('shouldOfferHint', () => {
  it('easy: offers hint after 1 wrong answer', () => {
    expect(shouldOfferHint('easy', 0)).toBe(false)
    expect(shouldOfferHint('easy', 1)).toBe(true)
    expect(shouldOfferHint('easy', 3)).toBe(true)
  })

  it('normal: offers hint after 2 wrong answers', () => {
    expect(shouldOfferHint('normal', 1)).toBe(false)
    expect(shouldOfferHint('normal', 2)).toBe(true)
  })

  it('hard: offers hint after 3 wrong answers', () => {
    expect(shouldOfferHint('hard', 2)).toBe(false)
    expect(shouldOfferHint('hard', 3)).toBe(true)
  })

  it('unknown difficulty: never offers hint', () => {
    expect(shouldOfferHint('unknown', 99)).toBe(false)
  })
})

describe('getHintLevel', () => {
  it('easy → long', ()   => expect(getHintLevel('easy')).toBe('long'))
  it('normal → medium', () => expect(getHintLevel('normal')).toBe('medium'))
  it('hard → short', ()  => expect(getHintLevel('hard')).toBe('short'))

  it('unknown difficulty → medium (safe fallthrough)', () => {
    expect(getHintLevel('unknown')).toBe('medium')
  })
})
