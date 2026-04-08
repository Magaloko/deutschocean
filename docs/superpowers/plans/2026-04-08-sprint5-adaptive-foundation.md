# Sprint 5: Adaptive Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build shared adaptive learning infrastructure (adaptivityEngine, useAdaptivity, useHints) and integrate it into FehlerDetektiv, NomenFinder, and SilbenPuzzle.

**Architecture:** Pure-function engine (`adaptivityEngine.js`) tracks session error rate and derives difficulty + hint level. React hooks (`useAdaptivity`, `useHints`) wrap it for game components. Initial difficulty is seeded from `weakGames` (Firestore, written by Sprint 1). Ozzy mascot reacts to difficulty changes via two new events.

**Tech Stack:** React 18, Vite 5, Firebase Firestore, vitest (new), Web Speech API (existing `speak()`)

**Prerequisites:** Sprints 1–4 branches merged to main before starting this sprint.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/adaptivityEngine.js` | Create | Pure functions: difficulty, hint level, hint offer |
| `src/lib/adaptivityEngine.test.js` | Create | Unit tests for engine |
| `src/hooks/useAdaptivity.js` | Create | Session stats + difficulty state |
| `src/hooks/useHints.js` | Create | Hint show/dismiss with TTS |
| `package.json` | Modify | Add vitest |
| `vite.config.js` | Modify | Add test config block |
| `src/lib/gameData.js` | Modify | Add `difficulty` field to 3 data arrays |
| `src/hooks/useOzzy.js` | Modify | Add `levelUp` / `levelDown` events |
| `src/components/game/OzzyMascot.jsx` | Modify | Add `levelUp` / `levelDown` to MOODS |
| `src/pages/app/games/FehlerDetektiv.jsx` | Modify | Add Ozzy + full adaptivity |
| `src/pages/app/games/NomenFinder.jsx` | Modify | Add adaptivity (Ozzy already present from Sprint 3) |
| `src/pages/app/games/SilbenPuzzle.jsx` | Modify | Add adaptivity (Ozzy already present from Sprint 3) |
| `src/pages/app/games/Game.module.css` | Modify | Add hint UI styles |

---

## Task 1: Vitest Setup + adaptivityEngine.js

**Files:**
- Create: `src/lib/adaptivityEngine.js`
- Create: `src/lib/adaptivityEngine.test.js`
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add test scripts to `package.json`**

In `package.json`, add inside `"scripts"`:
```json
"test":       "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Add test config to `vite.config.js`**

Replace full file content:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT) || 5174,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Write the failing tests first**

Create `src/lib/adaptivityEngine.test.js`:
```js
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
})

describe('getHintLevel', () => {
  it('easy → long', ()   => expect(getHintLevel('easy')).toBe('long'))
  it('normal → medium', () => expect(getHintLevel('normal')).toBe('medium'))
  it('hard → short', ()  => expect(getHintLevel('hard')).toBe('short'))
})
```

- [ ] **Step 5: Run tests — expect FAIL**

```bash
npm test
```

Expected: `Error: Cannot find module './adaptivityEngine.js'`

- [ ] **Step 6: Create `src/lib/adaptivityEngine.js`**

```js
// src/lib/adaptivityEngine.js

/**
 * Berechnet Schwierigkeitsstufe aus Session-Statistiken.
 * Benötigt mindestens 3 Versuche für eine Aussage.
 *
 * @param {{ correct: number, total: number }} stats
 * @returns {'easy' | 'normal' | 'hard'}
 */
export function getSessionDifficulty({ correct, total }) {
  if (total < 3) return 'normal'
  const errorRate = (total - correct) / total
  if (errorRate > 0.6) return 'easy'
  if (errorRate < 0.3 && total >= 5) return 'hard'
  return 'normal'
}

/**
 * Entscheidet ob ein Hint-Button angeboten werden soll.
 *
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @param {number} wrongCount - Anzahl Fehler in Folge
 * @returns {boolean}
 */
export function shouldOfferHint(difficulty, wrongCount) {
  if (difficulty === 'easy')   return wrongCount >= 1
  if (difficulty === 'normal') return wrongCount >= 2
  if (difficulty === 'hard')   return wrongCount >= 3
  return false
}

/**
 * Gibt den Hint-Tiefe-Level für die aktuelle Schwierigkeit zurück.
 *
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @returns {'long' | 'medium' | 'short'}
 */
export function getHintLevel(difficulty) {
  if (difficulty === 'easy') return 'long'
  if (difficulty === 'hard') return 'short'
  return 'medium'
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npm test
```

Expected:
```
✓ src/lib/adaptivityEngine.test.js (9)
  ✓ getSessionDifficulty (5)
  ✓ shouldOfferHint (3)
  ✓ getHintLevel (3)
Test Files  1 passed (1)
Tests       9 passed (9)
```

- [ ] **Step 8: Commit**

```bash
git add package.json vite.config.js src/lib/adaptivityEngine.js src/lib/adaptivityEngine.test.js
git commit -m "feat: add adaptivityEngine with vitest (sprint 5)"
```

---

## Task 2: useAdaptivity Hook

**Files:**
- Create: `src/hooks/useAdaptivity.js`

- [ ] **Step 1: Create `src/hooks/useAdaptivity.js`**

```js
// src/hooks/useAdaptivity.js
import { useState, useCallback } from 'react'
import { getSessionDifficulty } from '../lib/adaptivityEngine.js'

/**
 * Verfolgt Session-Statistiken und leitet adaptive Schwierigkeit ab.
 *
 * @param {'easy' | 'normal' | 'hard'} initialDifficulty
 *   Startschwierigkeit — aus weakGames abgeleitet:
 *   weakGames[missionId] > 0 → 'easy', sonst 'normal'
 *
 * @returns {{
 *   difficulty: 'easy' | 'normal' | 'hard',
 *   wrongCount: number,
 *   recordAnswer: (isCorrect: boolean) => void,
 *   reset: () => void,
 *   sessionStats: { correct: number, total: number },
 * }}
 */
export function useAdaptivity(initialDifficulty = 'normal') {
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [wrongStreak,  setWrongStreak]  = useState(0)
  const [difficulty,   setDifficulty]   = useState(initialDifficulty)

  const recordAnswer = useCallback((isCorrect) => {
    setSessionStats((prev) => {
      const next = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total:   prev.total + 1,
      }
      setDifficulty(getSessionDifficulty(next))
      return next
    })
    setWrongStreak((prev) => (isCorrect ? 0 : prev + 1))
  }, [])

  const reset = useCallback(() => {
    setSessionStats({ correct: 0, total: 0 })
    setWrongStreak(0)
    setDifficulty(initialDifficulty)
  }, [initialDifficulty])

  return { difficulty, wrongCount: wrongStreak, recordAnswer, reset, sessionStats }
}
```

- [ ] **Step 2: Verify build still passes (no new tests — hook needs React env)**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAdaptivity.js
git commit -m "feat: add useAdaptivity hook (sprint 5)"
```

---

## Task 3: useHints Hook

**Files:**
- Create: `src/hooks/useHints.js`

- [ ] **Step 1: Create `src/hooks/useHints.js`**

```js
// src/hooks/useHints.js
import { useState, useCallback } from 'react'
import { getHintLevel, shouldOfferHint } from '../lib/adaptivityEngine.js'
import { speak } from '../lib/sounds.js'

/**
 * Verwaltet Hint-Anzeige für ein Spiel.
 * Wählt automatisch den richtigen Hint-Level (long/medium/short)
 * basierend auf aktueller Schwierigkeit.
 * Long-Hints lösen TTS (speak()) aus wenn hint.tts === true.
 *
 * @param {{ long: { text: string, tts: boolean }, medium: { text: string, tts: boolean }, short: { text: string, tts: boolean } }} hintsMap
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @param {number} wrongCount
 *
 * @returns {{
 *   hint: { text: string, tts: boolean } | null,
 *   showHint: () => void,
 *   dismissHint: () => void,
 * }}
 */
export function useHints(hintsMap, difficulty, wrongCount) {
  const [hint, setHint] = useState(null)

  const showHint = useCallback(() => {
    if (!shouldOfferHint(difficulty, wrongCount)) return
    const level = getHintLevel(difficulty)
    const h = hintsMap[level]
    if (!h) return
    setHint(h)
    if (h.tts) speak(h.text)
  }, [hintsMap, difficulty, wrongCount])

  const dismissHint = useCallback(() => setHint(null), [])

  return { hint, showHint, dismissHint }
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useHints.js
git commit -m "feat: add useHints hook with TTS support (sprint 5)"
```

---

## Task 4: Annotate gameData.js with Difficulty Fields

**Files:**
- Modify: `src/lib/gameData.js`

- [ ] **Step 1: Add `difficulty` field to `FEHLER_DETEKTIV_TASKS`**

In `src/lib/gameData.js`, replace the entire `FEHLER_DETEKTIV_TASKS` array (lines 334–497) with:

```js
export const FEHLER_DETEKTIV_TASKS = [
  // ── easy: ≤3 Fehler, kurze/bekannte Wörter ──
  {
    id: 'fd1', difficulty: 'easy',
    text: 'der hund läuft schnell über die straße.',
    errors: [
      { word: 'der',    correct: 'Der',    reason: 'Satzanfang → Großschreibung' },
      { word: 'hund',   correct: 'Hund',   reason: 'Nomen → Großschreibung' },
      { word: 'straße', correct: 'Straße', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Der Hund läuft schnell über die Straße.',
  },
  {
    id: 'fd2', difficulty: 'easy',
    text: 'anna geht mit ihrer katze in den park.',
    errors: [
      { word: 'anna',  correct: 'Anna',  reason: 'Eigenname → Großschreibung' },
      { word: 'katze', correct: 'Katze', reason: 'Nomen → Großschreibung' },
      { word: 'park',  correct: 'Park',  reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Anna geht mit ihrer Katze in den Park.',
  },
  {
    id: 'fd14', difficulty: 'easy',
    text: 'paul fährt mit dem fahrrad zum schwimmbad.',
    errors: [
      { word: 'paul',       correct: 'Paul',       reason: 'Eigenname → Großschreibung' },
      { word: 'fahrrad',    correct: 'Fahrrad',    reason: 'Nomen → Großschreibung' },
      { word: 'schwimmbad', correct: 'Schwimmbad', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Paul fährt mit dem Fahrrad zum Schwimmbad.',
  },
  {
    id: 'fd15', difficulty: 'easy',
    text: 'am morgen esse ich ein brötchen mit butter.',
    errors: [
      { word: 'am',       correct: 'Am',       reason: 'Satzanfang → Großschreibung' },
      { word: 'brötchen', correct: 'Brötchen', reason: 'Nomen → Großschreibung' },
      { word: 'butter',   correct: 'Butter',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Am Morgen esse ich ein Brötchen mit Butter.',
  },
  // ── normal: 4 Fehler, mittlere Komplexität ──
  {
    id: 'fd3', difficulty: 'normal',
    text: 'das kind spielt im garten mit einem ball.',
    errors: [
      { word: 'das',    correct: 'Das',    reason: 'Satzanfang → Großschreibung' },
      { word: 'kind',   correct: 'Kind',   reason: 'Nomen → Großschreibung' },
      { word: 'garten', correct: 'Garten', reason: 'Nomen → Großschreibung' },
      { word: 'ball',   correct: 'Ball',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Das Kind spielt im Garten mit einem Ball.',
  },
  {
    id: 'fd4', difficulty: 'normal',
    text: 'die lehrerin schreibt die aufgabe an die tafel.',
    errors: [
      { word: 'die',      correct: 'Die',      reason: 'Satzanfang → Großschreibung' },
      { word: 'lehrerin', correct: 'Lehrerin', reason: 'Nomen → Großschreibung' },
      { word: 'aufgabe',  correct: 'Aufgabe',  reason: 'Nomen → Großschreibung' },
      { word: 'tafel',    correct: 'Tafel',    reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Lehrerin schreibt die Aufgabe an die Tafel.',
  },
  {
    id: 'fd7', difficulty: 'normal',
    text: 'die mutter backt einen kuchen für den geburtstag.',
    errors: [
      { word: 'die',        correct: 'Die',        reason: 'Satzanfang → Großschreibung' },
      { word: 'mutter',     correct: 'Mutter',     reason: 'Nomen → Großschreibung' },
      { word: 'kuchen',     correct: 'Kuchen',     reason: 'Nomen → Großschreibung' },
      { word: 'geburtstag', correct: 'Geburtstag', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Mutter backt einen Kuchen für den Geburtstag.',
  },
  {
    id: 'fd8', difficulty: 'normal',
    text: 'tom und lisa spielen nach der schule fußball.',
    errors: [
      { word: 'tom',     correct: 'Tom',     reason: 'Eigenname → Großschreibung' },
      { word: 'lisa',    correct: 'Lisa',    reason: 'Eigenname → Großschreibung' },
      { word: 'schule',  correct: 'Schule',  reason: 'Nomen → Großschreibung' },
      { word: 'fußball', correct: 'Fußball', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Tom und Lisa spielen nach der Schule Fußball.',
  },
  {
    id: 'fd9', difficulty: 'normal',
    text: 'das kaninchen frisst möhren und salat.',
    errors: [
      { word: 'das',       correct: 'Das',       reason: 'Satzanfang → Großschreibung' },
      { word: 'kaninchen', correct: 'Kaninchen', reason: 'Nomen → Großschreibung' },
      { word: 'möhren',    correct: 'Möhren',    reason: 'Nomen → Großschreibung' },
      { word: 'salat',     correct: 'Salat',     reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Das Kaninchen frisst Möhren und Salat.',
  },
  {
    id: 'fd10', difficulty: 'normal',
    text: 'im winter liegt viel schnee auf dem berg.',
    errors: [
      { word: 'im',     correct: 'Im',     reason: 'Satzanfang → Großschreibung' },
      { word: 'winter', correct: 'Winter', reason: 'Nomen → Großschreibung' },
      { word: 'schnee', correct: 'Schnee', reason: 'Nomen → Großschreibung' },
      { word: 'berg',   correct: 'Berg',   reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Im Winter liegt viel Schnee auf dem Berg.',
  },
  // ── hard: ≥4 Fehler oder schwieriger Wortschatz ──
  {
    id: 'fd5', difficulty: 'hard',
    text: 'der vater kauft brot und milch im supermarkt.',
    errors: [
      { word: 'der',        correct: 'Der',        reason: 'Satzanfang → Großschreibung' },
      { word: 'vater',      correct: 'Vater',      reason: 'Nomen → Großschreibung' },
      { word: 'brot',       correct: 'Brot',       reason: 'Nomen → Großschreibung' },
      { word: 'milch',      correct: 'Milch',      reason: 'Nomen → Großschreibung' },
      { word: 'supermarkt', correct: 'Supermarkt', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Der Vater kauft Brot und Milch im Supermarkt.',
  },
  {
    id: 'fd6', difficulty: 'hard',
    text: 'mein bruder liest ein buch über dinosaurier.',
    errors: [
      { word: 'mein',        correct: 'Mein',        reason: 'Satzanfang → Großschreibung' },
      { word: 'bruder',      correct: 'Bruder',      reason: 'Nomen → Großschreibung' },
      { word: 'buch',        correct: 'Buch',        reason: 'Nomen → Großschreibung' },
      { word: 'dinosaurier', correct: 'Dinosaurier', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Mein Bruder liest ein Buch über Dinosaurier.',
  },
  {
    id: 'fd11', difficulty: 'hard',
    text: 'die sonne scheint und die blumen blühen im frühling.',
    errors: [
      { word: 'die',      correct: 'Die',      reason: 'Satzanfang → Großschreibung' },
      { word: 'sonne',    correct: 'Sonne',    reason: 'Nomen → Großschreibung' },
      { word: 'blumen',   correct: 'Blumen',   reason: 'Nomen → Großschreibung' },
      { word: 'frühling', correct: 'Frühling', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Sonne scheint und die Blumen blühen im Frühling.',
  },
  {
    id: 'fd12', difficulty: 'hard',
    text: 'der arzt untersucht den patienten im krankenhaus.',
    errors: [
      { word: 'der',         correct: 'Der',         reason: 'Satzanfang → Großschreibung' },
      { word: 'arzt',        correct: 'Arzt',        reason: 'Nomen → Großschreibung' },
      { word: 'patienten',   correct: 'Patienten',   reason: 'Nomen → Großschreibung' },
      { word: 'krankenhaus', correct: 'Krankenhaus', reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Der Arzt untersucht den Patienten im Krankenhaus.',
  },
  {
    id: 'fd13', difficulty: 'hard',
    text: 'die schüler machen ihre hausaufgaben am tisch.',
    errors: [
      { word: 'die',          correct: 'Die',          reason: 'Satzanfang → Großschreibung' },
      { word: 'schüler',      correct: 'Schüler',      reason: 'Nomen → Großschreibung' },
      { word: 'hausaufgaben', correct: 'Hausaufgaben', reason: 'Nomen → Großschreibung' },
      { word: 'tisch',        correct: 'Tisch',        reason: 'Nomen → Großschreibung' },
    ],
    corrected: 'Die Schüler machen ihre Hausaufgaben am Tisch.',
  },
]
```

- [ ] **Step 2: Add `difficulty` field to `SILBEN_WOERTER`**

In `src/lib/gameData.js`, replace the `SILBEN_WOERTER` array (lines 628–645) with:

```js
export const SILBEN_WOERTER = [
  // ── easy: 2 Silben ──
  { word: 'Schule',    silben: ['Schu', 'le'],          difficulty: 'easy' },
  { word: 'Fenster',   silben: ['Fens', 'ter'],         difficulty: 'easy' },
  { word: 'Bleistift', silben: ['Blei', 'stift'],       difficulty: 'easy' },
  { word: 'Frühstück', silben: ['Früh', 'stück'],       difficulty: 'easy' },
  { word: 'Fahrrad',   silben: ['Fahr', 'rad'],         difficulty: 'easy' },
  { word: 'Handschuh', silben: ['Hand', 'schuh'],       difficulty: 'easy' },
  // ── normal: 3 Silben ──
  { word: 'Geburtstag',  silben: ['Ge', 'burts', 'tag'],       difficulty: 'normal' },
  { word: 'Schmetterling', silben: ['Schmet', 'ter', 'ling'],  difficulty: 'normal' },
  { word: 'Erdbeere',    silben: ['Erd', 'bee', 're'],         difficulty: 'normal' },
  { word: 'Krankenhaus', silben: ['Kran', 'ken', 'haus'],      difficulty: 'normal' },
  { word: 'Supermarkt',  silben: ['Su', 'per', 'markt'],       difficulty: 'normal' },
  { word: 'Apfelbaum',   silben: ['Ap', 'fel', 'baum'],        difficulty: 'normal' },
  // ── hard: 4 Silben ──
  { word: 'Hausaufgabe',  silben: ['Haus', 'auf', 'ga', 'be'],   difficulty: 'hard' },
  { word: 'Taschenlampe', silben: ['Ta', 'schen', 'lam', 'pe'],  difficulty: 'hard' },
  { word: 'Winterjacke',  silben: ['Win', 'ter', 'jack', 'e'],   difficulty: 'hard' },
  { word: 'Blumenvase',   silben: ['Blu', 'men', 'va', 'se'],    difficulty: 'hard' },
]
```

- [ ] **Step 3: Add `difficulty` field to `NOMEN_SAETZE`**

In `src/lib/gameData.js`, replace the `NOMEN_SAETZE` array (lines 667–728) with:

```js
export const NOMEN_SAETZE = [
  // ── easy: 2 Nomen, kurzer Satz ──
  {
    id: 'n1', difficulty: 'easy',
    sentence: 'Der kleine Hund läuft schnell über die Straße.',
    nouns: ['Hund', 'Straße'],
    words: ['Der', 'kleine', 'Hund', 'läuft', 'schnell', 'über', 'die', 'Straße'],
  },
  {
    id: 'n6', difficulty: 'easy',
    sentence: 'Die Katze schläft auf dem Sofa.',
    nouns: ['Katze', 'Sofa'],
    words: ['Die', 'Katze', 'schläft', 'auf', 'dem', 'Sofa'],
  },
  {
    id: 'n8', difficulty: 'easy',
    sentence: 'Im Sommer fahren wir ans Meer.',
    nouns: ['Sommer', 'Meer'],
    words: ['Im', 'Sommer', 'fahren', 'wir', 'ans', 'Meer'],
  },
  // ── normal: 3 Nomen, mittlere Länge ──
  {
    id: 'n2', difficulty: 'normal',
    sentence: 'Das Mädchen liest ein Buch in der Schule.',
    nouns: ['Mädchen', 'Buch', 'Schule'],
    words: ['Das', 'Mädchen', 'liest', 'ein', 'Buch', 'in', 'der', 'Schule'],
  },
  {
    id: 'n3', difficulty: 'normal',
    sentence: 'Die Lehrerin schreibt einen Brief an die Eltern.',
    nouns: ['Lehrerin', 'Brief', 'Eltern'],
    words: ['Die', 'Lehrerin', 'schreibt', 'einen', 'Brief', 'an', 'die', 'Eltern'],
  },
  {
    id: 'n5', difficulty: 'normal',
    sentence: 'Das Kind spielt mit dem Ball im Garten.',
    nouns: ['Kind', 'Ball', 'Garten'],
    words: ['Das', 'Kind', 'spielt', 'mit', 'dem', 'Ball', 'im', 'Garten'],
  },
  {
    id: 'n9', difficulty: 'normal',
    sentence: 'Die Mutter backt einen Kuchen für den Geburtstag.',
    nouns: ['Mutter', 'Kuchen', 'Geburtstag'],
    words: ['Die', 'Mutter', 'backt', 'einen', 'Kuchen', 'für', 'den', 'Geburtstag'],
  },
  {
    id: 'n10', difficulty: 'normal',
    sentence: 'Der Schüler trägt seinen Rucksack zur Schule.',
    nouns: ['Schüler', 'Rucksack', 'Schule'],
    words: ['Der', 'Schüler', 'trägt', 'seinen', 'Rucksack', 'zur', 'Schule'],
  },
  // ── hard: 4 Nomen oder schwieriger Wortschatz ──
  {
    id: 'n4', difficulty: 'hard',
    sentence: 'Der Vater kauft Brot und Milch im Supermarkt.',
    nouns: ['Vater', 'Brot', 'Milch', 'Supermarkt'],
    words: ['Der', 'Vater', 'kauft', 'Brot', 'und', 'Milch', 'im', 'Supermarkt'],
  },
  {
    id: 'n7', difficulty: 'hard',
    sentence: 'Der Arzt hilft dem Patienten im Krankenhaus.',
    nouns: ['Arzt', 'Patienten', 'Krankenhaus'],
    words: ['Der', 'Arzt', 'hilft', 'dem', 'Patienten', 'im', 'Krankenhaus'],
  },
]
```

- [ ] **Step 4: Run tests to ensure nothing broke**

```bash
npm test
```

Expected: 9 tests still passing.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/gameData.js
git commit -m "feat: annotate game data with difficulty levels (sprint 5)"
```

---

## Task 5: Add levelUp/levelDown to useOzzy + OzzyMascot

**Files:**
- Modify: `src/hooks/useOzzy.js`
- Modify: `src/components/game/OzzyMascot.jsx`

- [ ] **Step 1: Add message arrays + cases to `src/hooks/useOzzy.js`**

Add after the existing `CELEBRATE_MESSAGES` constant:
```js
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
```

In the `switch (event)` block inside `react`, add after `case 'thinking':`:
```js
      case 'levelUp':
        setMood('levelUp')
        setMessage(pick(LEVEL_UP_MESSAGES))
        break
      case 'levelDown':
        setMood('levelDown')
        setMessage(pick(LEVEL_DOWN_MESSAGES))
        break
```

- [ ] **Step 2: Add levelUp/levelDown to MOODS in `src/components/game/OzzyMascot.jsx`**

In `OzzyMascot.jsx`, replace the `MOODS` constant:
```js
const MOODS = {
  idle:      { face: '🐙' },
  correct:   { face: '🐙' },
  wrong:     { face: '🐙' },
  thinking:  { face: '🐙' },
  celebrate: { face: '🐙' },
  levelUp:   { face: '🐙' },
  levelDown: { face: '🐙' },
}
```

- [ ] **Step 3: Run tests + build**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useOzzy.js src/components/game/OzzyMascot.jsx
git commit -m "feat: add levelUp/levelDown events to Ozzy (sprint 5)"
```

---

## Task 6: Add Hint CSS to Game.module.css

**Files:**
- Modify: `src/pages/app/games/Game.module.css`

- [ ] **Step 1: Append hint styles to `Game.module.css`**

Append at the end of `src/pages/app/games/Game.module.css`:

```css
/* ── Adaptive Hints (Sprint 5) ── */
.hintBtn {
  display: block;
  margin: 0.5rem auto 0.75rem;
  padding: 0.35rem 1rem;
  background: transparent;
  border: 1.5px solid #f59e0b;
  border-radius: 999px;
  color: #f59e0b;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.hintBtn:hover {
  background: #fef3c7;
}
.hintBox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.5rem 0 0.75rem;
  padding: 0.65rem 0.85rem;
  background: #fef3c7;
  border: 1.5px solid #f59e0b;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #92400e;
}
.hintText {
  flex: 1;
  margin: 0;
  line-height: 1.45;
}
.hintDismiss {
  background: transparent;
  border: none;
  color: #92400e;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  line-height: 1;
  flex-shrink: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/games/Game.module.css
git commit -m "feat: add hint UI styles to Game.module.css (sprint 5)"
```

---

## Task 7: Integrate Adaptivity into FehlerDetektiv

**Files:**
- Modify: `src/pages/app/games/FehlerDetektiv.jsx`

- [ ] **Step 1: Replace `FehlerDetektiv.jsx` with the adaptive version**

```jsx
// src/pages/app/games/FehlerDetektiv.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { FEHLER_DETEKTIV_TASKS } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

const TOTAL = 3

const HINTS = {
  long:   {
    text: 'Suche nach Nomen (Dinge, Tiere, Personen, Orte) — die werden groß geschrieben! Auch der erste Buchstabe im Satz ist immer groß.',
    tts:  true,
  },
  medium: {
    text: 'Nomen und der Satzanfang werden immer groß geschrieben.',
    tts:  false,
  },
  short:  { text: '💡 Groß- oder Kleinschreibung prüfen!', tts: false },
}

function getTaskPool(difficulty) {
  const pool = FEHLER_DETEKTIV_TASKS.filter((t) => t.difficulty === difficulty)
  return pool.length >= TOTAL ? pool : FEHLER_DETEKTIV_TASKS
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function FehlerDetektiv() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['fehler-detektiv-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [tasks]          = useState(() => shuffle(getTaskPool(initialDifficulty)).slice(0, TOTAL))
  const [taskIdx, setTaskIdx]     = useState(0)
  const [selected, setSelected]   = useState(new Set())
  const [checked, setChecked]     = useState(false)
  const [score, setScore]         = useState(0)
  const [phase, setPhase]         = useState('playing') // 'playing' | 'result'

  // Ozzy reaction on difficulty change
  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const task = tasks[taskIdx]
  if (!task) return null

  const words      = task.text.split(' ')
  const errorWords = new Set(task.errors.map((e) => e.word))

  function toggleWord(word) {
    if (checked) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(word) ? next.delete(word) : next.add(word)
      return next
    })
  }

  function handleCheck() {
    const correct =
      task.errors.every((e) => selected.has(e.word)) &&
      [...selected].every((w) => errorWords.has(w))
    if (correct) { setScore((s) => s + 1); playCorrect(); ozzReact('correct') }
    else         { playWrong(); ozzReact('wrong') }
    recordAnswer(correct)
    setChecked(true)
    dismissHint()
  }

  function handleNext() {
    if (taskIdx + 1 >= TOTAL) { setPhase('result') }
    else {
      setTaskIdx((i) => i + 1)
      setSelected(new Set())
      setChecked(false)
      dismissHint()
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'fehler-detektiv-1', xpEarned: score * 5, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🏆' : score >= 2 ? '⭐' : '💪'}</div>
        <h1 className={styles.resultTitle}>
          {score === TOTAL ? 'Perfekt!' : score >= 2 ? 'Sehr gut!' : 'Weiter üben!'}
        </h1>
        <p className={styles.resultSub}>{score} von {TOTAL} Aufgaben richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 5} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 2 ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Ergebnis speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🔍</span>
          <h1 className={styles.gameTitle}>Fehler-Detektiv</h1>
        </div>
        <Badge color="gray">{taskIdx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <p className={styles.instruction}>
          Tippe auf die <strong>falsch geschriebenen Wörter</strong> im Satz.
        </p>

        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        <div className={styles.tokenRow}>
          {words.map((word, i) => {
            const clean      = word.replace(/[.,!?]$/, '')
            const punct      = word.slice(clean.length)
            const isSelected = selected.has(clean)
            const isError    = errorWords.has(clean)
            let cls = styles.token
            if (checked) cls += isError ? ` ${styles.tokenError}` : ` ${styles.tokenOk}`
            else if (isSelected) cls += ` ${styles.tokenSelected}`
            return (
              <span key={i}>
                <button className={cls} onClick={() => toggleWord(clean)} disabled={checked}>{clean}</button>
                {punct}
              </span>
            )
          })}
        </div>

        {checked && (
          <div className={`${styles.feedback} fade-in`}>
            <p className={styles.feedbackTitle}>Richtig geschrieben:</p>
            <p className={styles.corrected}>{task.corrected}</p>
            <div className={styles.errorList}>
              {task.errors.map((e) => (
                <div key={e.word} className={styles.errorItem}>
                  <span className={styles.errorWrong}>{e.word}</span>
                  <span className={styles.errorArrow}>→</span>
                  <span className={styles.errorRight}>{e.correct}</span>
                  <span className={styles.errorReason}>{e.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {!checked
            ? <Button onClick={handleCheck} disabled={selected.size === 0} size="lg">Überprüfen</Button>
            : <Button onClick={handleNext} size="lg">{taskIdx + 1 >= TOTAL ? 'Ergebnis ansehen' : 'Weiter →'}</Button>
          }
        </div>
      </Card>

      <div className={styles.progressDots}>
        {tasks.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < taskIdx ? styles.dotDone : i === taskIdx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests + build**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 3: Manual smoke test**

Run `npm run dev`, navigate to `/app/spiel/fehler-detektiv`. Verify:
- Ozzy appears above the card
- After getting 1–2 wrong: "💡 Tipp anzeigen" button appears
- Clicking hint shows hint box with ✕ dismiss
- Long hint (easy mode) triggers TTS via browser

- [ ] **Step 4: Commit**

```bash
git add src/pages/app/games/FehlerDetektiv.jsx
git commit -m "feat: adaptive difficulty + hints + Ozzy in FehlerDetektiv (sprint 5)"
```

---

## Task 8: Integrate Adaptivity into NomenFinder

**Files:**
- Modify: `src/pages/app/games/NomenFinder.jsx`

*(Ozzy + useOzzy already integrated from Sprint 3)*

- [ ] **Step 1: Replace `NomenFinder.jsx` with the adaptive version**

```jsx
// src/pages/app/games/NomenFinder.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { NOMEN_SAETZE } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const HINTS = {
  long:   {
    text: 'Nomen sind Dinge, Lebewesen oder Orte — sie werden IMMER großgeschrieben! Merkhilfe: Du kannst "ein/eine" davorstellen: ein Hund, eine Schule.',
    tts:  true,
  },
  medium: { text: 'Nomen erkennt man oft am "ein" oder "die/der/das" davor.', tts: false },
  short:  { text: '💡 Großschreibung = Nomen?', tts: false },
}

function getTaskPool(difficulty) {
  const pool = NOMEN_SAETZE.filter((t) => t.difficulty === difficulty)
  return pool.length >= 3 ? pool : NOMEN_SAETZE
}

const TOTAL = NOMEN_SAETZE.length

export default function NomenFinder() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['nomen-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [tasks]   = useState(() => shuffle(getTaskPool(initialDifficulty)))
  const [idx, setIdx]           = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [checked, setChecked]   = useState(false)
  const [score, setScore]       = useState(0)
  const [phase, setPhase]       = useState('playing')

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const task = tasks[idx]
  if (!task) return null
  const nouns = new Set(task.nouns)

  function toggleWord(word) {
    if (checked) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(word) ? next.delete(word) : next.add(word)
      return next
    })
  }

  function handleCheck() {
    const allFound  = task.nouns.every((n) => selected.has(n))
    const noFalse   = [...selected].every((w) => nouns.has(w))
    const correct   = allFound && noFalse
    if (correct) { setScore((s) => s + 1); playCorrect(); ozzReact('correct') }
    else         { playWrong(); ozzReact('wrong') }
    recordAnswer(correct)
    setChecked(true)
    dismissHint()
  }

  function handleNext() {
    if (idx + 1 >= tasks.length) { setPhase('result') }
    else {
      setIdx((i) => i + 1)
      setSelected(new Set())
      setChecked(false)
      dismissHint()
    }
  }

  async function handleFinish() {
    const stars = score === tasks.length ? 3 : score >= 2 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'nomen-1', xpEarned: score * 5, stars, correct: score, total: tasks.length })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === tasks.length ? '🏹' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === tasks.length ? 'Alle Nomen gefunden!' : 'Weiter üben!'}</h1>
        <p className={styles.resultSub}>{score}/{tasks.length} Sätze korrekt</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 5} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === tasks.length ? 3 : score >= 2 ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🏹</span>
          <h1 className={styles.gameTitle}>Nomen-Jäger</h1>
        </div>
        <Badge color="gray">{idx + 1}/{tasks.length}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={styles.gameCard}>
        <p className={styles.instruction}>
          Tippe alle <strong>Nomen</strong> (Hauptwörter) im Satz an! Nomen sind immer großgeschrieben.
        </p>

        <div className={styles.nomenHint}>
          <Badge color="blue">Tipp: Nomen = Person, Tier, Sache, Ort</Badge>
        </div>

        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        <div className={styles.tokenRow}>
          {task.words.map((word, i) => {
            const isNoun     = nouns.has(word)
            const isSelected = selected.has(word)
            let cls = styles.token
            if (checked) {
              if (isNoun && isSelected)   cls += ` ${styles.tokenOk}`
              else if (isNoun)            cls += ` ${styles.tokenError}`
              else if (isSelected)        cls += ` ${styles.tokenError}`
            } else if (isSelected) {
              cls += ` ${styles.tokenSelected}`
            }
            return (
              <button key={i} className={cls} onClick={() => toggleWord(word)} disabled={checked}>
                {word}
              </button>
            )
          })}
        </div>

        {checked && (
          <div className={`${styles.feedback} fade-in`}>
            <p className={styles.feedbackTitle}>Die Nomen im Satz:</p>
            <div className={styles.errorList}>
              {task.nouns.map((n) => (
                <div key={n} className={`${styles.errorItem} ${selected.has(n) ? styles.foundOk : styles.foundMiss}`}>
                  {selected.has(n) ? '✓' : '✗'} {n}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {!checked
            ? <Button onClick={handleCheck} disabled={selected.size === 0} size="lg">Überprüfen</Button>
            : <Button onClick={handleNext} size="lg">{idx + 1 >= tasks.length ? 'Ergebnis' : 'Weiter →'}</Button>
          }
        </div>
      </Card>

      <div className={styles.progressDots}>
        {tasks.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests + build**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/games/NomenFinder.jsx
git commit -m "feat: adaptive difficulty + hints in NomenFinder (sprint 5)"
```

---

## Task 9: Integrate Adaptivity into SilbenPuzzle

**Files:**
- Modify: `src/pages/app/games/SilbenPuzzle.jsx`

*(Ozzy + useOzzy already integrated from Sprint 3)*

- [ ] **Step 1: Replace `SilbenPuzzle.jsx` with the adaptive version**

```jsx
// src/pages/app/games/SilbenPuzzle.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { SILBEN_WOERTER } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

const HINTS = {
  long:   {
    text: 'Silben sind kleine Lautbausteine eines Wortes. Sprich das Wort laut und klatsche dazu — jeder Klatsch ist eine Silbe! Schu-le = 2 Silben.',
    tts:  true,
  },
  medium: { text: 'Sprich das Wort laut und klatsche die Silben.', tts: false },
  short:  { text: '💡 Laut sprechen und klatschen!', tts: false },
}

function getWordPool(difficulty) {
  const pool = SILBEN_WOERTER.filter((w) => w.difficulty === difficulty)
  return pool.length >= TOTAL ? pool : SILBEN_WOERTER
}

export default function SilbenPuzzle() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['silben-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [words]     = useState(() => shuffle(getWordPool(initialDifficulty)).slice(0, TOTAL))
  const [idx, setIdx]           = useState(0)
  const [placed, setPlaced]     = useState([])
  const [bank, setBank]         = useState([])
  const [checked, setChecked]   = useState(false)
  const [score, setScore]       = useState(0)
  const [phase, setPhase]       = useState('playing')

  const word = words[idx]

  const initBank = useCallback((w) => shuffle([...w.silben]), [])

  function startWord(w) {
    setBank(initBank(w))
    setPlaced([])
    setChecked(false)
    dismissHint()
  }

  useEffect(() => {
    if (words[idx]) startWord(words[idx])
  }, [idx])

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  function addSilbe(s, bankIdx) {
    if (checked) return
    setPlaced((p) => [...p, s])
    setBank((b) => b.filter((_, i) => i !== bankIdx))
  }

  function removeSilbe(s, placedIdx) {
    if (checked) return
    setPlaced((p) => p.filter((_, i) => i !== placedIdx))
    setBank((b) => [...b, s])
  }

  function handleCheck() {
    const attempt = placed.join('')
    const correct = attempt === word.word
    if (correct) { setScore((s) => s + 1); playCorrect(); ozzReact('correct') }
    else         { playWrong(); ozzReact('wrong') }
    recordAnswer(correct)
    setChecked(true)
    dismissHint()
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) { setPhase('result') }
    else { setIdx((i) => i + 1) }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'silben-1', xpEarned: score * 3, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🧩' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Puzzle gelöst!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} Wörter korrekt</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 3} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 3 ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  const attempt   = placed.join('')
  const isCorrect = checked && attempt === word.word
  const isWrong   = checked && attempt !== word.word

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🧩</span>
          <h1 className={styles.gameTitle}>Silben-Puzzle</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={`${styles.gameCard} ${isCorrect ? styles.cardSuccess : isWrong ? styles.cardError : ''}`}>
        <p className={styles.instruction}>
          Setze die <strong>Silben</strong> in der richtigen Reihenfolge zusammen!
        </p>

        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        <div className={styles.dropZone}>
          {placed.length === 0 ? (
            <span className={styles.dropPlaceholder}>Tippe auf Silben unten ↓</span>
          ) : (
            placed.map((s, i) => (
              <button
                key={i}
                className={`${styles.silbeToken} ${styles.silbePlaced} ${isCorrect ? styles.silbeCorrect : isWrong ? styles.silbeWrong : ''}`}
                onClick={() => removeSilbe(s, i)}
                disabled={checked}
              >
                {s}
              </button>
            ))
          )}
        </div>

        {checked && (
          <div className={`${styles.resultBanner} ${isCorrect ? styles.resultGreen : styles.resultRed}`}>
            {isCorrect ? `✓ Richtig! Das Wort ist "${word.word}".` : `✗ Falsch. Richtig wäre: "${word.word}"`}
          </div>
        )}

        <div className={styles.silbenBank}>
          {bank.map((s, i) => (
            <button key={i} className={styles.silbeToken} onClick={() => addSilbe(s, i)} disabled={checked}>
              {s}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {!checked
            ? <Button onClick={handleCheck} disabled={bank.length > 0} size="lg">Überprüfen</Button>
            : <Button onClick={handleNext} size="lg">{idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}</Button>
          }
        </div>
      </Card>

      <div className={styles.progressDots}>
        {words.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run final tests + build**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/games/SilbenPuzzle.jsx
git commit -m "feat: adaptive difficulty + hints in SilbenPuzzle (sprint 5)"
```

---

## Done

All Sprint 5 tasks complete. The adaptive foundation is live in FehlerDetektiv, NomenFinder, and SilbenPuzzle.

Verify end-to-end before PR:
```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds, no ESLint errors.
