# Sprint 7: WortFamilien + Feinschliff — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new WortFamilien game (pattern recognition via word families); add hint usage tracking to Firestore; show "Adaptive Hilfe genutzt" in StatsPage.

**Architecture:** WortFamilien uses tap-to-select + tap-to-assign UX (mobile-first). Hint tracking: `completeSession()` gets optional `hintsUsed` param → stored as `totalHintsUsed` counter in Firestore (atomic increment). All Sprint 5/6 games pass `hintsUsed` count at session end.

**Tech Stack:** React 18, Vite 5, Firebase Firestore increment, existing hooks

**Prerequisites:** Sprints 5–6 merged to main before starting this sprint.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/gameData.js` | Modify | Add WORTFAMILIEN_SETS data + MISSIONS entry |
| `src/hooks/useProgress.jsx` | Modify | Accept `hintsUsed` in `completeSession`; write `totalHintsUsed` |
| `src/hooks/useHints.js` | Modify | Track and expose `hintsUsedCount` |
| `src/pages/app/games/FehlerDetektiv.jsx` | Modify | Pass `hintsUsed` to `completeSession` |
| `src/pages/app/games/NomenFinder.jsx` | Modify | Pass `hintsUsed` to `completeSession` |
| `src/pages/app/games/SilbenPuzzle.jsx` | Modify | Pass `hintsUsed` to `completeSession` |
| `src/pages/app/games/BuchstabenChaos.jsx` | Modify | Pass `hintsUsed` to `completeSession` |
| `src/pages/app/games/SatzBuilder.jsx` | Modify | Pass `hintsUsed` to `completeSession` |
| `src/pages/app/games/RegelRaupe.jsx` | Modify | Pass `hintsUsed` to `completeSession` |
| `src/pages/app/games/WortFamilien.jsx` | Create | New game — word family pattern recognition |
| `src/pages/app/games/WortFamilien.module.css` | Create | WortFamilien styles |
| `src/App.jsx` | Modify | Add WortFamilien route |
| `src/pages/app/StatsPage.jsx` | Modify | Show `totalHintsUsed` |
| `src/hooks/useAuth.jsx` | Modify | Add `totalHintsUsed: 0` to `makeProfile` default |

---

## Task 1: Add WORTFAMILIEN_SETS to gameData.js

**Files:**
- Modify: `src/lib/gameData.js`

- [ ] **Step 1: Append `WORTFAMILIEN_SETS` to gameData.js (before end of file)**

```js
// WortFamilien — Mustererkennung in Wortfamilien
// Mechanic: Wörter der gleichen Wurzel einem Familien-Eimer zuordnen
export const WORTFAMILIEN_SETS = [
  // ── easy: 2 Familien, je 3 Wörter, klare Wurzeln ──
  {
    id: 'wf1', difficulty: 'easy',
    families: [
      { id: 'a', root: 'fahr', label: 'fahr-', color: '#4f46e5', words: ['fahren', 'Fahrer', 'Fahrt'] },
      { id: 'b', root: 'lauf', label: 'lauf-', color: '#10b981', words: ['laufen', 'Läufer', 'Lauf'] },
    ],
  },
  {
    id: 'wf2', difficulty: 'easy',
    families: [
      { id: 'a', root: 'spiel', label: 'spiel-', color: '#f97316', words: ['spielen', 'Spieler', 'Spiel'] },
      { id: 'b', root: 'lern', label: 'lern-',  color: '#6366f1', words: ['lernen', 'Lerner', 'Lernzeit'] },
    ],
  },
  {
    id: 'wf3', difficulty: 'easy',
    families: [
      { id: 'a', root: 'back', label: 'back-', color: '#ec4899', words: ['backen', 'Bäcker', 'Backwerk'] },
      { id: 'b', root: 'koch', label: 'koch-', color: '#f59e0b', words: ['kochen', 'Koch', 'Kochzeit'] },
    ],
  },
  // ── normal: 2 Familien, je 5 Wörter, ähnlich klingende Wurzeln ──
  {
    id: 'wf4', difficulty: 'normal',
    families: [
      { id: 'a', root: 'fahr', label: 'fahr-', color: '#4f46e5',
        words: ['fahren', 'Fahrer', 'Fahrt', 'Abfahrt', 'Einfahrt'] },
      { id: 'b', root: 'lauf', label: 'lauf-', color: '#10b981',
        words: ['laufen', 'Läufer', 'Lauf', 'Auflauf', 'Anlauf'] },
    ],
  },
  {
    id: 'wf5', difficulty: 'normal',
    families: [
      { id: 'a', root: 'schreib', label: 'schreib-', color: '#6366f1',
        words: ['schreiben', 'Schreiber', 'Schrift', 'Aufschrift', 'beschriften'] },
      { id: 'b', root: 'les', label: 'les-', color: '#ec4899',
        words: ['lesen', 'Leser', 'Lesung', 'vorlesen', 'ablesen'] },
    ],
  },
  // ── hard: 3 Familien, je 4 Wörter, Fallen ──
  {
    id: 'wf6', difficulty: 'hard',
    families: [
      { id: 'a', root: 'fahr', label: 'fahr-', color: '#4f46e5',
        words: ['fahren', 'Fahrer', 'Abfahrt', 'einfahren'] },
      { id: 'b', root: 'lauf', label: 'lauf-', color: '#10b981',
        words: ['laufen', 'Läufer', 'Auflauf', 'anlaufen'] },
      { id: 'c', root: 'spring', label: 'spring-', color: '#f97316',
        words: ['springen', 'Springer', 'Sprung', 'Absprung'] },
    ],
  },
]
```

- [ ] **Step 2: Add MISSIONS entry for WortFamilien** (insert in MISSIONS array after RegelRaupe):

```js
{
  id: 'wort-familien-1',
  type: 'wortFamilien',
  title: 'WortFamilien',
  description: 'Sortiere Wörter nach ihrer Wortwurzel!',
  icon: '🌳',
  xp: 20,
  stars: 3,
  level: 1,
  color: '#10b981',
},
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: 9 tests passing.

- [ ] **Step 4: Commit**

```bash
git add src/lib/gameData.js
git commit -m "feat: add WORTFAMILIEN_SETS data + MISSIONS entry (sprint 7)"
```

---

## Task 2: Add Hint Usage Tracking

**Files:**
- Modify: `src/hooks/useHints.js`
- Modify: `src/hooks/useProgress.jsx`
- Modify: `src/hooks/useAuth.jsx`

- [ ] **Step 1: Expose `hintsUsedCount` from `useHints`**

Replace full `src/hooks/useHints.js`:

```js
// src/hooks/useHints.js
import { useState, useCallback } from 'react'
import { getHintLevel, shouldOfferHint } from '../lib/adaptivityEngine.js'
import { speak } from '../lib/sounds.js'

/**
 * Verwaltet Hint-Anzeige für ein Spiel.
 *
 * @param {{ long: { text: string, tts: boolean }, medium: { text: string, tts: boolean }, short: { text: string, tts: boolean } }} hintsMap
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @param {number} wrongCount
 *
 * @returns {{
 *   hint: { text: string, tts: boolean } | null,
 *   showHint: () => void,
 *   dismissHint: () => void,
 *   hintsUsedCount: number,
 * }}
 */
export function useHints(hintsMap, difficulty, wrongCount) {
  const [hint, setHint]                 = useState(null)
  const [hintsUsedCount, setHintsUsedCount] = useState(0)

  const showHint = useCallback(() => {
    if (!shouldOfferHint(difficulty, wrongCount)) return
    const level = getHintLevel(difficulty)
    const h = hintsMap[level]
    if (!h) return
    setHint(h)
    setHintsUsedCount((n) => n + 1)
    if (h.tts) speak(h.text)
  }, [hintsMap, difficulty, wrongCount])

  const dismissHint = useCallback(() => setHint(null), [])

  return { hint, showHint, dismissHint, hintsUsedCount }
}
```

- [ ] **Step 2: Add `totalHintsUsed: 0` to makeProfile in `useAuth.jsx`**

In `src/hooks/useAuth.jsx`, in the `makeProfile` function, add `totalHintsUsed: 0` after `unlockedBadges`:

```js
function makeProfile(uid, name, avatar, schoolModule, isAnonymous) {
  const now = new Date().toISOString()
  return {
    uid,
    name:              name       || 'Gast',
    avatar:            avatar     || '🐬',
    schoolModule:      schoolModule || 'volksschule',
    isAnonymous:       Boolean(isAnonymous),
    xp:                0,
    stars:             0,
    streakDays:        0,
    lastActiveDate:    null,
    completedMissions: [],
    unlockedBadges:    [],
    totalHintsUsed:    0,
    createdAt:         now,
    updatedAt:         now,
  }
}
```

- [ ] **Step 3: Update `useProgress.jsx` to accept and write `hintsUsed`**

In `src/hooks/useProgress.jsx`, update `completeSession` to handle `hintsUsed`:

```js
// src/hooks/useProgress.jsx
import { useState } from 'react'
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { useAuth } from './useAuth.jsx'
import { BADGES } from '../lib/gameData.js'

export function useProgress() {
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)

  async function completeSession({ missionId, xpEarned, stars, correct, total, hintsUsed = 0 }) {
    if (!profile || !auth.currentUser) return { newBadges: [] }
    setSaving(true)
    try {
      const newXP    = (profile.xp    ?? 0) + xpEarned
      const newStars = (profile.stars ?? 0) + stars
      const newBadges = BADGES
        .filter(b => !(profile.unlockedBadges ?? []).includes(b.id) && newXP >= b.xpRequired)
        .map(b => b.id)

      const updates = {
        xp:                newXP,
        stars:             newStars,
        completedMissions: arrayUnion(missionId),
        lastActiveDate:    new Date().toISOString(),
        updatedAt:         new Date().toISOString(),
      }
      if (newBadges.length) updates.unlockedBadges = arrayUnion(...newBadges)

      // Weakness tracking
      if (typeof correct === 'number' && typeof total === 'number' && total > 0) {
        const accuracy = correct / total
        if (accuracy < 0.6) {
          updates[`weakGames.${missionId}`] = increment(1)
        } else if (accuracy === 1.0) {
          updates[`weakGames.${missionId}`] = 0
        }
      }

      // Hint usage tracking
      if (hintsUsed > 0) {
        updates.totalHintsUsed = increment(hintsUsed)
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates)
      return { newBadges }
    } finally {
      setSaving(false)
    }
  }

  return {
    completeSession,
    saving,
    completedMissions: profile?.completedMissions ?? [],
    weakGames: profile?.weakGames ?? {},
  }
}
```

- [ ] **Step 4: Run tests + build**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useHints.js src/hooks/useProgress.jsx src/hooks/useAuth.jsx
git commit -m "feat: hint usage tracking — hintsUsedCount + totalHintsUsed in Firestore (sprint 7)"
```

---

## Task 3: Wire hintsUsedCount into Games (Sprint 5/6 Games)

For each of the 6 games from Sprints 5+6 (FehlerDetektiv, NomenFinder, SilbenPuzzle, BuchstabenChaos, SatzBuilder, RegelRaupe), make two small changes:

**Change A:** Destructure `hintsUsedCount` from `useHints`:
```js
const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
```

**Change B:** Pass `hintsUsed` to `completeSession` in `handleFinish`:
```js
await completeSession({ ..., hintsUsed: hintsUsedCount })
```

- [ ] **Step 1: Update FehlerDetektiv.jsx** (lines where useHints is destructured + handleFinish)

- [ ] **Step 2: Update NomenFinder.jsx**

- [ ] **Step 3: Update SilbenPuzzle.jsx**

- [ ] **Step 4: Update BuchstabenChaos.jsx**

- [ ] **Step 5: Update SatzBuilder.jsx**

- [ ] **Step 6: Update RegelRaupe.jsx**

- [ ] **Step 7: Build + commit**

```bash
npm run build
git add src/pages/app/games/FehlerDetektiv.jsx src/pages/app/games/NomenFinder.jsx src/pages/app/games/SilbenPuzzle.jsx src/pages/app/games/BuchstabenChaos.jsx src/pages/app/games/SatzBuilder.jsx src/pages/app/games/RegelRaupe.jsx
git commit -m "feat: pass hintsUsed to completeSession in all adaptive games (sprint 7)"
```

---

## Task 4: Build WortFamilien Game

**Files:**
- Create: `src/pages/app/games/WortFamilien.jsx`
- Create: `src/pages/app/games/WortFamilien.module.css`

- [ ] **Step 1: Create `WortFamilien.module.css`**

```css
/* src/pages/app/games/WortFamilien.module.css */
.page {
  padding: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

/* Family zones at top */
.familyZones {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.familyZone {
  flex: 1;
  min-height: 120px;
  border-radius: 14px;
  border: 2.5px dashed var(--family-color, #4f46e5);
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: color-mix(in srgb, var(--family-color, #4f46e5) 6%, white);
  cursor: pointer;
  transition: background 0.15s;
}
.familyZone:hover,
.familyZoneActive {
  background: color-mix(in srgb, var(--family-color, #4f46e5) 15%, white);
  border-style: solid;
}

.familyZoneLabel {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--family-color, #4f46e5);
  text-align: center;
  padding-bottom: 0.25rem;
  border-bottom: 1.5px solid var(--family-color, #4f46e5);
  margin-bottom: 0.15rem;
}

.familyWord {
  padding: 0.3rem 0.5rem;
  background: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.familyWordCorrect {
  background: #dcfce7;
  color: #166534;
}

.familyWordWrong {
  background: #fee2e2;
  color: #991b1b;
}

/* Word bank at bottom */
.wordBank {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin: 0.75rem 0;
}

.wordCard {
  padding: 0.55rem 1rem;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: transform 0.1s, background 0.1s, border-color 0.1s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.wordCard:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}
.wordCardSelected {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4f46e5;
  transform: scale(1.04);
}

.instruction {
  font-size: 0.88rem;
  color: #64748b;
  text-align: center;
  margin: 0 0 0.5rem;
}

.checkBtn {
  margin-top: 0.75rem;
  width: 100%;
}
```

- [ ] **Step 2: Create `WortFamilien.jsx`**

```jsx
// src/pages/app/games/WortFamilien.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { WORTFAMILIEN_SETS } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import gameStyles from './Game.module.css'
import styles from './WortFamilien.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL_ROUNDS = 3

const HINTS = {
  long:   {
    text: 'Wörter einer Familie haben dieselbe Wurzel — also denselben Grundbaustein. "fahren", "Fahrer", "Fahrt" gehören alle zur Wurzel "fahr-". Hörst du den gemeinsamen Klang?',
    tts:  true,
  },
  medium: { text: 'Hör auf den gemeinsamen Klang der Wörter — die Wurzel klingt ähnlich.', tts: false },
  short:  { text: '💡 Gleiche Wurzel = gleiche Familie!', tts: false },
}

function getSetPool(difficulty) {
  const pool = WORTFAMILIEN_SETS.filter((s) => s.difficulty === difficulty)
  return pool.length >= TOTAL_ROUNDS ? pool : WORTFAMILIEN_SETS
}

export default function WortFamilien() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['wort-familien-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact } = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [sets]              = useState(() => shuffle(getSetPool(initialDifficulty)).slice(0, TOTAL_ROUNDS))
  const [roundIdx, setRoundIdx]     = useState(0)
  const [selectedWord, setSelectedWord] = useState(null) // word string or null
  const [assignments, setAssignments]   = useState({})   // { word: familyId }
  const [checked, setChecked]           = useState(false)
  const [score, setScore]               = useState(0)    // rounds with perfect score
  const [phase, setPhase]               = useState('playing') // 'playing' | 'result'

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const currentSet = sets[roundIdx]
  if (!currentSet) return null

  // All words from all families, shuffled
  const allWords = shuffle(currentSet.families.flatMap((f) => f.words))

  // Correct mapping: word → familyId
  const correctMap = {}
  for (const f of currentSet.families) {
    for (const w of f.words) correctMap[w] = f.id
  }

  const unassigned = allWords.filter((w) => !assignments[w])

  function handleWordTap(word) {
    if (checked) return
    setSelectedWord((prev) => (prev === word ? null : word))
  }

  function handleFamilyTap(familyId) {
    if (!selectedWord || checked) return
    setAssignments((prev) => ({ ...prev, [selectedWord]: familyId }))
    setSelectedWord(null)
    dismissHint()
  }

  function handleCheck() {
    // Count correct assignments
    let correct = 0
    for (const [word, fid] of Object.entries(assignments)) {
      if (correctMap[word] === fid) correct++
    }
    const allCorrect = correct === allWords.length
    if (allCorrect) { playCorrect(); ozzReact('correct'); setScore((s) => s + 1) }
    else            { playWrong();   ozzReact('wrong') }
    // Record as correct only if all words right
    recordAnswer(allCorrect)
    setChecked(true)
  }

  function handleNext() {
    if (roundIdx + 1 >= TOTAL_ROUNDS) {
      setPhase('result')
    } else {
      setRoundIdx((i) => i + 1)
      setAssignments({})
      setSelectedWord(null)
      setChecked(false)
      dismissHint()
    }
  }

  async function handleFinish() {
    const xpEarned = score * 10 + (score === TOTAL_ROUNDS ? 15 : 0)
    const stars    = score === TOTAL_ROUNDS ? 3 : score >= 2 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'wort-familien-1', xpEarned, stars, correct: score, total: TOTAL_ROUNDS, hintsUsed: hintsUsedCount })
    navigate('/app')
  }

  // ── Result screen ──
  if (phase === 'result') {
    return (
      <div className={gameStyles.resultPage}>
        <div className={gameStyles.resultEmoji}>{score === TOTAL_ROUNDS ? '🌳' : '⭐'}</div>
        <h1 className={gameStyles.resultTitle}>
          {score === TOTAL_ROUNDS ? 'Wortforscher!' : 'Gut gemacht!'}
        </h1>
        <p className={gameStyles.resultSub}>{score}/{TOTAL_ROUNDS} Runden perfekt</p>
        <div className={gameStyles.resultStats}>
          <Badge color="purple">+{score * 10 + (score === TOTAL_ROUNDS ? 15 : 0)} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL_ROUNDS ? 3 : score >= 2 ? 2 : 1)}</Badge>
        </div>
        <div className={gameStyles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${gameStyles.gamePage} fade-in`}>
      <div className={gameStyles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={gameStyles.gameInfo}>
          <span className={gameStyles.gameEmoji}>🌳</span>
          <h1 className={gameStyles.gameTitle}>WortFamilien</h1>
        </div>
        <Badge color="gray">{roundIdx + 1}/{TOTAL_ROUNDS}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <p className={styles.instruction}>
        {selectedWord
          ? <>Tippe eine Familie für <strong>"{selectedWord}"</strong>:</>
          : 'Tippe ein Wort, dann wähle seine Familie!'}
      </p>

      {hint ? (
        <div className={gameStyles.hintBox}>
          <p className={gameStyles.hintText}>{hint.text}</p>
          <button className={gameStyles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
        </div>
      ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
        <button className={gameStyles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
      )}

      {/* Family zones */}
      <div className={styles.familyZones}>
        {currentSet.families.map((f) => (
          <div
            key={f.id}
            className={`${styles.familyZone} ${selectedWord ? styles.familyZoneActive : ''}`}
            style={{ '--family-color': f.color }}
            onClick={() => handleFamilyTap(f.id)}
          >
            <div className={styles.familyZoneLabel}>{f.label}</div>
            {allWords
              .filter((w) => assignments[w] === f.id)
              .map((w) => {
                const isCorrect = checked && correctMap[w] === f.id
                const isWrong   = checked && correctMap[w] !== f.id
                return (
                  <div
                    key={w}
                    className={`${styles.familyWord} ${isCorrect ? styles.familyWordCorrect : isWrong ? styles.familyWordWrong : ''}`}
                  >
                    {w}
                  </div>
                )
              })
            }
          </div>
        ))}
      </div>

      {/* Unassigned word bank */}
      {!checked && (
        <div className={styles.wordBank}>
          {unassigned.map((w) => (
            <button
              key={w}
              className={`${styles.wordCard} ${selectedWord === w ? styles.wordCardSelected : ''}`}
              onClick={() => handleWordTap(w)}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Check button — appears when all words assigned */}
      {!checked && unassigned.length === 0 && (
        <Button className={styles.checkBtn} onClick={handleCheck} size="lg">
          Überprüfen ✓
        </Button>
      )}

      {/* Next button after check */}
      {checked && (
        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <Button onClick={handleNext} size="lg">
            {roundIdx + 1 >= TOTAL_ROUNDS ? 'Ergebnis' : 'Nächste Runde →'}
          </Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build + test**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/app/games/WortFamilien.jsx src/pages/app/games/WortFamilien.module.css
git commit -m "feat: new WortFamilien game — word family pattern recognition (sprint 7)"
```

---

## Task 5: Register WortFamilien Route in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add lazy import and route**

Add lazy import:
```js
const WortFamilien = lazy(() => import('./pages/app/games/WortFamilien.jsx'))
```

Add route:
```jsx
<Route path="spiel/wort-familien" element={<WortFamilien />} />
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/App.jsx
git commit -m "feat: add WortFamilien route (sprint 7)"
```

---

## Task 6: Show totalHintsUsed in StatsPage

**Files:**
- Modify: `src/pages/app/StatsPage.jsx`
- Modify: `src/pages/app/StatsPage.module.css`

- [ ] **Step 1: Add totalHintsUsed to StatsPage**

In `src/pages/app/StatsPage.jsx`, add after the `badges` const:
```js
const hintsUsed = profile?.totalHintsUsed ?? 0
```

Add a new hero card in the `heroRow` section (after the existing 4 cards):
```jsx
<div className={styles.heroCard}>
  <div className={styles.heroNum}>{hintsUsed}</div>
  <div className={styles.heroLabel}>💡 Tipps genutzt</div>
</div>
```

- [ ] **Step 2: Build + test**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 3: Manual smoke test**

Navigate to `/app/stats`. Verify "💡 Tipps genutzt" card appears in the hero row with value 0 (or actual count if hints were used).

- [ ] **Step 4: Commit**

```bash
git add src/pages/app/StatsPage.jsx
git commit -m "feat: show totalHintsUsed in StatsPage (sprint 7)"
```

---

## Task 7: Hint Quality Review

No code changes — review pass to ensure all hint texts are appropriate for Volksschule.

- [ ] **Step 1: Open each game file and read the `HINTS` constant**

For each game: FehlerDetektiv, NomenFinder, SilbenPuzzle, BuchstabenChaos, SatzBuilder, WasFehlt, FalscherGegenstand, Personenbeschreibung, DiktatModus, RegelRaupe, WortFamilien

Check each `long` hint against these criteria:
1. Max 2 sentences for `long` hints
2. No words longer than 12 characters (Volksschul-readable)
3. TTS = true only for `long` hints
4. All hints answer "why" not just "what"

- [ ] **Step 2: Fix any hints that fail the criteria, commit**

```bash
git add src/pages/app/games/*.jsx
git commit -m "fix: hint text quality review — Volksschul-readable (sprint 7)"
```

---

## Done

Sprint 7 complete. Full adaptive learning system live across all games.

Final check:
```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds, no ESLint errors.
