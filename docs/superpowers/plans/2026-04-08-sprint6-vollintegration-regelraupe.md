# Sprint 6: Vollintegration + RegelRaupe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate adaptive difficulty + hints into 6 remaining core Deutsch games; build the new RegelRaupe game (conditional grammar logic); add difficulty badge to Dashboard mission cards.

**Architecture:** Same pattern as Sprint 5 — `useAdaptivity` + `useHints` + `useOzzy` in each game, seeded from `weakGames`. RegelRaupe is a new word-by-word capitalization game. Data-driven: sentences with word-level `capitalize + rule` metadata.

**Tech Stack:** React 18, Vite 5, Firebase Firestore, vitest (from Sprint 5), existing `useAdaptivity`/`useHints`/`useOzzy` hooks

**Prerequisites:** Sprint 5 merged to main before starting this sprint.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/gameData.js` | Modify | Add `difficulty` to CHAOS_WOERTER + SATZ_AUFGABEN; add REGELRAUPE_SAETZE |
| `src/pages/app/games/BuchstabenChaos.jsx` | Modify | Add Ozzy + adaptivity |
| `src/pages/app/games/SatzBuilder.jsx` | Modify | Add Ozzy + adaptivity |
| `src/pages/app/games/WasFehlt.jsx` | Modify | Add Ozzy + adaptivity |
| `src/pages/app/games/FalscherGegenstand.jsx` | Modify | Add Ozzy + adaptivity |
| `src/pages/app/games/Personenbeschreibung.jsx` | Modify | Add Ozzy + adaptivity |
| `src/pages/app/games/DiktatModus.jsx` | Modify | Add Ozzy + adaptivity |
| `src/pages/app/games/RegelRaupe.jsx` | Create | New game — conditional grammar logic |
| `src/pages/app/games/RegelRaupe.module.css` | Create | RegelRaupe-specific styles |
| `src/App.jsx` | Modify | Add RegelRaupe route `/app/spiel/regel-raupe` |
| `src/lib/gameData.js` | Modify | Add MISSIONS entry for RegelRaupe |
| `src/pages/app/DashboardPage.jsx` | Modify | Difficulty badge on mission cards |

---

## Task 1: Annotate CHAOS_WOERTER + SATZ_AUFGABEN + Add REGELRAUPE_SAETZE

**Files:**
- Modify: `src/lib/gameData.js`

- [ ] **Step 1: Add `difficulty` to CHAOS_WOERTER** (replace array at line 648):

```js
export const CHAOS_WOERTER = [
  // ── easy: 4 Buchstaben ──
  { word: 'HUND',  scrambled: 'NDUH',   difficulty: 'easy' },
  { word: 'BUCH',  scrambled: 'UHCB',   difficulty: 'easy' },
  { word: 'BAUM',  scrambled: 'UMAB',   difficulty: 'easy' },
  { word: 'HAUS',  scrambled: 'SUAH',   difficulty: 'easy' },
  // ── normal: 5–6 Buchstaben ──
  { word: 'KATZE',  scrambled: 'TAEKZ',  difficulty: 'normal' },
  { word: 'TISCH',  scrambled: 'CSIHT',  difficulty: 'normal' },
  { word: 'STUHL',  scrambled: 'SLUTH',  difficulty: 'normal' },
  { word: 'BRIEF',  scrambled: 'FRBIE',  difficulty: 'normal' },
  { word: 'APFEL',  scrambled: 'LEFAP',  difficulty: 'normal' },
  { word: 'BLUME',  scrambled: 'MEBLU',  difficulty: 'normal' },
  { word: 'VOGEL',  scrambled: 'GLOEV',  difficulty: 'normal' },
  { word: 'SCHULE', scrambled: 'LEHSCU', difficulty: 'normal' },
  // ── hard: 6–7 Buchstaben ──
  { word: 'BRÜCKE',  scrambled: 'KÜCBRE',  difficulty: 'hard' },
  { word: 'GARTEN',  scrambled: 'NETRAG',  difficulty: 'hard' },
  { word: 'FENSTER', scrambled: 'RENSTEF', difficulty: 'hard' },
]
```

- [ ] **Step 2: Add `difficulty` to SATZ_AUFGABEN** (replace array at line 731):

```js
export const SATZ_AUFGABEN = [
  // ── easy: ≤5 Wörter ──
  { id: 'sb1', difficulty: 'easy',
    words: ['Der', 'Hund', 'bellt', 'laut.'],
    correct: 'Der Hund bellt laut.' },
  { id: 'sb3', difficulty: 'easy',
    words: ['Das', 'Kind', 'isst', 'einen', 'Apfel.'],
    correct: 'Das Kind isst einen Apfel.' },
  { id: 'sb6', difficulty: 'easy',
    words: ['Meine', 'Schwester', 'liest', 'ein', 'Buch.'],
    correct: 'Meine Schwester liest ein Buch.' },
  { id: 'sb7', difficulty: 'easy',
    words: ['Der', 'Lehrer', 'erklärt', 'die', 'Aufgabe.'],
    correct: 'Der Lehrer erklärt die Aufgabe.' },
  { id: 'sb10', difficulty: 'easy',
    words: ['Jeden', 'Morgen', 'trinke', 'ich', 'Milch.'],
    correct: 'Jeden Morgen trinke ich Milch.' },
  // ── normal: 6 Wörter, bekannte Wörter ──
  { id: 'sb2', difficulty: 'normal',
    words: ['Die', 'Katze', 'schläft', 'auf', 'dem', 'Sofa.'],
    correct: 'Die Katze schläft auf dem Sofa.' },
  { id: 'sb4', difficulty: 'normal',
    words: ['Wir', 'gehen', 'heute', 'in', 'den', 'Park.'],
    correct: 'Wir gehen heute in den Park.' },
  { id: 'sb5', difficulty: 'normal',
    words: ['Die', 'Sonne', 'scheint', 'hell', 'am', 'Himmel.'],
    correct: 'Die Sonne scheint hell am Himmel.' },
  { id: 'sb8', difficulty: 'normal',
    words: ['Im', 'Winter', 'ist', 'es', 'sehr', 'kalt.'],
    correct: 'Im Winter ist es sehr kalt.' },
  { id: 'sb11', difficulty: 'normal',
    words: ['Der', 'Vogel', 'singt', 'auf', 'dem', 'Baum.'],
    correct: 'Der Vogel singt auf dem Baum.' },
  // ── hard: 6 Wörter, komplexere Struktur ──
  { id: 'sb9', difficulty: 'hard',
    words: ['Das', 'Mädchen', 'malt', 'ein', 'buntes', 'Bild.'],
    correct: 'Das Mädchen malt ein buntes Bild.' },
  { id: 'sb12', difficulty: 'hard',
    words: ['Wir', 'spielen', 'nach', 'der', 'Schule', 'Fußball.'],
    correct: 'Wir spielen nach der Schule Fußball.' },
]
```

- [ ] **Step 3: Add REGELRAUPE_SAETZE** (append before the `// KINDER-SPIELE` section):

```js
// RegelRaupe — Konditionelle Grammatik (Sätze nach Schwierigkeit)
// Mechanic: Wort für Wort tippen → Groß oder Klein?
export const REGELRAUPE_SAETZE = [
  // ── easy: 4 Wörter, nur Satzanfang + 1 Nomen ──
  {
    id: 'rr1', difficulty: 'easy',
    words: [
      { text: 'der',     capitalize: true,  rule: 'Satzanfang' },
      { text: 'hund',    capitalize: true,  rule: 'Nomen' },
      { text: 'läuft',   capitalize: false, rule: 'Verb' },
      { text: 'schnell', capitalize: false, rule: 'Adjektiv' },
    ],
  },
  {
    id: 'rr2', difficulty: 'easy',
    words: [
      { text: 'die',    capitalize: true,  rule: 'Satzanfang' },
      { text: 'katze',  capitalize: true,  rule: 'Nomen' },
      { text: 'schläft', capitalize: false, rule: 'Verb' },
      { text: 'tief',   capitalize: false, rule: 'Adjektiv' },
    ],
  },
  {
    id: 'rr3', difficulty: 'easy',
    words: [
      { text: 'das',    capitalize: true,  rule: 'Satzanfang' },
      { text: 'kind',   capitalize: true,  rule: 'Nomen' },
      { text: 'lacht',  capitalize: false, rule: 'Verb' },
      { text: 'laut',   capitalize: false, rule: 'Adjektiv' },
    ],
  },
  // ── normal: 5–6 Wörter, Satzanfang + 2 Nomen + Verb/Adjektiv ──
  {
    id: 'rr4', difficulty: 'normal',
    words: [
      { text: 'der',    capitalize: true,  rule: 'Satzanfang' },
      { text: 'vater',  capitalize: true,  rule: 'Nomen' },
      { text: 'kauft',  capitalize: false, rule: 'Verb' },
      { text: 'frisches', capitalize: false, rule: 'Adjektiv' },
      { text: 'brot',   capitalize: true,  rule: 'Nomen' },
    ],
  },
  {
    id: 'rr5', difficulty: 'normal',
    words: [
      { text: 'anna',   capitalize: true,  rule: 'Eigenname' },
      { text: 'liest',  capitalize: false, rule: 'Verb' },
      { text: 'ein',    capitalize: false, rule: 'Artikel' },
      { text: 'spannendes', capitalize: false, rule: 'Adjektiv' },
      { text: 'buch',   capitalize: true,  rule: 'Nomen' },
    ],
  },
  {
    id: 'rr6', difficulty: 'normal',
    words: [
      { text: 'die',      capitalize: true,  rule: 'Satzanfang' },
      { text: 'lehrerin', capitalize: true,  rule: 'Nomen' },
      { text: 'schreibt', capitalize: false, rule: 'Verb' },
      { text: 'die',      capitalize: false, rule: 'Artikel' },
      { text: 'aufgabe',  capitalize: true,  rule: 'Nomen' },
      { text: 'auf',      capitalize: false, rule: 'Präposition' },
    ],
  },
  // ── hard: 6–8 Wörter, 3 Regeltypen, kein Satzanfang ──
  {
    id: 'rr7', difficulty: 'hard',
    words: [
      { text: 'im',         capitalize: true,  rule: 'Satzanfang' },
      { text: 'supermarkt', capitalize: true,  rule: 'Nomen' },
      { text: 'kauft',      capitalize: false, rule: 'Verb' },
      { text: 'der',        capitalize: false, rule: 'Artikel' },
      { text: 'vater',      capitalize: true,  rule: 'Nomen' },
      { text: 'frische',    capitalize: false, rule: 'Adjektiv' },
      { text: 'milch',      capitalize: true,  rule: 'Nomen' },
    ],
  },
  {
    id: 'rr8', difficulty: 'hard',
    words: [
      { text: 'paul',        capitalize: true,  rule: 'Eigenname' },
      { text: 'fährt',       capitalize: false, rule: 'Verb' },
      { text: 'mit',         capitalize: false, rule: 'Präposition' },
      { text: 'dem',         capitalize: false, rule: 'Artikel' },
      { text: 'fahrrad',     capitalize: true,  rule: 'Nomen' },
      { text: 'zum',         capitalize: false, rule: 'Präposition' },
      { text: 'schwimmbad',  capitalize: true,  rule: 'Nomen' },
    ],
  },
]
```

- [ ] **Step 4: Add MISSIONS entry for RegelRaupe** (insert in MISSIONS array at the appropriate level, after the Volksschule entries):

```js
{
  id: 'regel-raupe-1',
  type: 'regelRaupe',
  title: 'RegelRaupe',
  description: 'Entscheide Wort für Wort: Groß oder Klein?',
  icon: '🐛',
  xp: 20,
  stars: 3,
  level: 1,
  color: '#10b981',
},
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: 9 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/gameData.js
git commit -m "feat: add difficulty to CHAOS/SATZ data + REGELRAUPE_SAETZE (sprint 6)"
```

---

## Task 2: Integrate Adaptivity into BuchstabenChaos

**Files:**
- Modify: `src/pages/app/games/BuchstabenChaos.jsx`

- [ ] **Step 1: Replace `BuchstabenChaos.jsx`**

```jsx
// src/pages/app/games/BuchstabenChaos.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Input from '../../../components/ui/Input.jsx'
import { CHAOS_WOERTER } from '../../../lib/gameData.js'
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
    text: 'Schau jeden Buchstaben an und ordne sie: Welcher könnte der erste Buchstabe sein? Spreche das Wort laut und höre auf die Laute!',
    tts:  true,
  },
  medium: { text: 'Fang mit dem Anfangsbuchstaben an und baue das Wort auf.', tts: false },
  short:  { text: '💡 Laut vorlesen hilft!', tts: false },
}

function getWordPool(difficulty) {
  const pool = CHAOS_WOERTER.filter((w) => w.difficulty === difficulty)
  return pool.length >= TOTAL ? pool : CHAOS_WOERTER
}

export default function BuchstabenChaos() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['buchstaben-chaos-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [words]               = useState(() => shuffle(getWordPool(initialDifficulty)).slice(0, TOTAL))
  const [idx, setIdx]         = useState(0)
  const [answer, setAnswer]   = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore]     = useState(0)
  const [phase, setPhase]     = useState('playing')
  const [shake, setShake]     = useState(false)

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const item = words[idx]

  function handleCheck() {
    const correct = answer.toUpperCase().trim() === item.word
    if (correct) { setScore((s) => s + 1); playCorrect(); ozzReact('correct') }
    else {
      playWrong(); ozzReact('wrong')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
    recordAnswer(correct)
    setChecked(true)
    dismissHint()
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) { setPhase('result') }
    else {
      setIdx((i) => i + 1)
      setAnswer('')
      setChecked(false)
      dismissHint()
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'buchstaben-chaos-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🔤' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Chaos gemeistert!' : 'Fast!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} Wörter gelöst</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 2} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= 3 ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  const isCorrect = checked && answer.toUpperCase().trim() === item.word

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🔤</span>
          <h1 className={styles.gameTitle}>Buchstaben-Chaos</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={`${styles.gameCard} ${shake ? 'shake' : ''}`}>
        <p className={styles.instruction}>
          Bring die Buchstaben in die <strong>richtige Reihenfolge</strong>!
        </p>

        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        <div className={styles.chaosLetters}>
          {item.scrambled.split('').map((l, i) => (
            <span key={i} className={styles.chaosLetter}>{l}</span>
          ))}
        </div>

        <Input
          label="Deine Antwort"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Schreibe das Wort..."
          disabled={checked}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && !checked && answer.trim()) handleCheck() }}
        />

        {checked && (
          <div className={`${styles.resultBanner} ${isCorrect ? styles.resultGreen : styles.resultRed}`}>
            {isCorrect
              ? `✓ Richtig! Das Wort ist "${item.word}".`
              : `✗ Falsch. Das richtige Wort ist: "${item.word}"`}
          </div>
        )}

        <div className={styles.actions}>
          {!checked
            ? <Button onClick={handleCheck} disabled={!answer.trim()} size="lg">Überprüfen</Button>
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

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/games/BuchstabenChaos.jsx
git commit -m "feat: adaptive difficulty + hints + Ozzy in BuchstabenChaos (sprint 6)"
```

---

## Task 3: Integrate Adaptivity into SatzBuilder

**Files:**
- Modify: `src/pages/app/games/SatzBuilder.jsx`

- [ ] **Step 1: Replace `SatzBuilder.jsx`**

```jsx
// src/pages/app/games/SatzBuilder.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { SATZ_AUFGABEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 6

const HINTS = {
  long:   {
    text: 'Ein Satz hat Subjekt (Wer?), Verb (Was tut er?) und Objekt (Was/Wen?). Das Verb steht oft an zweiter Stelle im Satz!',
    tts:  true,
  },
  medium: { text: 'Das Verb (Tunwort) steht im Deutschen meist an zweiter Stelle.', tts: false },
  short:  { text: '💡 Verb an zweite Stelle!', tts: false },
}

function getTaskPool(difficulty) {
  const pool = SATZ_AUFGABEN.filter((t) => t.difficulty === difficulty)
  return pool.length >= TOTAL ? pool : SATZ_AUFGABEN
}

export default function SatzBuilder() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['satz-builder-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  const [tasks]               = useState(() => shuffle(getTaskPool(initialDifficulty)).slice(0, TOTAL))
  const [idx, setIdx]         = useState(0)
  const [bank, setBank]       = useState([])
  const [placed, setPlaced]   = useState([])
  const [checked, setChecked] = useState(false)
  const [score, setScore]     = useState(0)
  const [phase, setPhase]     = useState('playing')

  const task = tasks[idx]

  useEffect(() => {
    if (tasks[idx]) {
      setBank(shuffle([...tasks[idx].words]))
      setPlaced([])
      setChecked(false)
      dismissHint()
    }
  }, [idx])

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  function addWord(word, bankIdx) {
    if (checked) return
    setPlaced((p) => [...p, word])
    setBank((b) => b.filter((_, i) => i !== bankIdx))
  }

  function removeWord(word, placedIdx) {
    if (checked) return
    setPlaced((p) => p.filter((_, i) => i !== placedIdx))
    setBank((b) => [...b, word])
  }

  function handleCheck() {
    const attempt = placed.join(' ')
    const correct = attempt === task.correct
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
    await completeSession({ missionId: 'satz-builder-1', xpEarned: score * 4, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '🏗️' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Perfekt gebaut!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} Sätze korrekt</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 4} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(score === TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  const attempt   = placed.join(' ')
  const isCorrect = checked && attempt === task.correct
  const isWrong   = checked && attempt !== task.correct

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🏗️</span>
          <h1 className={styles.gameTitle}>Satz-Baumeister</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={`${styles.gameCard} ${isCorrect ? styles.cardSuccess : isWrong ? styles.cardError : ''}`}>
        <p className={styles.instruction}>
          Tippe auf die <strong>Wörter</strong> und bringe sie in die richtige Reihenfolge!
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
            <span className={styles.dropPlaceholder}>Tippe auf Wörter unten ↓</span>
          ) : (
            placed.map((w, i) => (
              <button
                key={i}
                className={`${styles.silbeToken} ${styles.silbePlaced} ${isCorrect ? styles.silbeCorrect : isWrong ? styles.silbeWrong : ''}`}
                onClick={() => removeWord(w, i)}
                disabled={checked}
              >
                {w}
              </button>
            ))
          )}
        </div>

        {checked && (
          <div className={`${styles.resultBanner} ${isCorrect ? styles.resultGreen : styles.resultRed}`}>
            {isCorrect ? `✓ Richtig! "${task.correct}"` : `✗ Falsch. Richtig: "${task.correct}"`}
          </div>
        )}

        <div className={styles.silbenBank}>
          {bank.map((w, i) => (
            <button key={i} className={styles.silbeToken} onClick={() => addWord(w, i)} disabled={checked}>
              {w}
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
        {tasks.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/app/games/SatzBuilder.jsx
git commit -m "feat: adaptive difficulty + hints + Ozzy in SatzBuilder (sprint 6)"
```

---

## Task 4: Integrate Adaptivity into WasFehlt, FalscherGegenstand, Personenbeschreibung, DiktatModus

These 4 games follow the **identical integration pattern** shown in Tasks 2–3.

For each game, do the following 4 sub-steps:

**Sub-step A: Read the current game file**
```bash
cat src/pages/app/games/<GameName>.jsx
```

**Sub-step B: Add these imports** (same as BuchstabenChaos):
```jsx
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
```

**Sub-step C: Add hooks at top of component** (after `useProgress`):
```js
const initialDifficulty = (weakGames['<missionId>'] ?? 0) > 0 ? 'easy' : 'normal'
const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
const { mood, message, react: ozzReact }       = useOzzy()
const prevDiffRef = useRef(initialDifficulty)
```

**Sub-step D: Add Ozzy + hint UI** (after game header, before Card):
```jsx
<div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
  <OzzyMascot mood={mood} message={message} />
</div>
```

And inside the Card, before the instruction:
```jsx
{hint ? (
  <div className={styles.hintBox}>
    <p className={styles.hintText}>{hint.text}</p>
    <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
  </div>
) : (!checked && shouldOfferHint(difficulty, wrongCount)) && (
  <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
)}
```

**Game-specific HINTS constants and missionIds:**

- [ ] **WasFehlt.jsx** — mission: `'was-fehlt-1'`

```js
const HINTS = {
  long:   { text: 'Merke dir alle Gegenstände genau — schau dir Farbe, Form und Position an! Dann verschwindet einer...', tts: true },
  medium: { text: 'Konzentriere dich auf jeden Gegenstand einzeln, dann überprüfe sie alle.', tts: false },
  short:  { text: '💡 Was war da — was fehlt jetzt?', tts: false },
}
```

- [ ] **FalscherGegenstand.jsx** — mission: `'falscher-gegenstand-1'`

```js
const HINTS = {
  long:   { text: 'Alle Gegenstände gehören zu einer Gruppe — außer einem! Überlege: Was passt thematisch nicht dazu?', tts: true },
  medium: { text: 'Welcher Gegenstand gehört nicht in diese Gruppe?', tts: false },
  short:  { text: '💡 Was passt nicht?', tts: false },
}
```

- [ ] **Personenbeschreibung.jsx** — mission: `'personenbeschreibung-1'`

```js
const HINTS = {
  long:   { text: 'Beschreibe die Person systematisch: Haare, Gesicht, Kleidung, Accessoires. Verwende "hat" für Körpermerkmale und "trägt" für Kleidung!', tts: true },
  medium: { text: 'Nutze "hat" für Aussehen und "trägt" für Kleidung.', tts: false },
  short:  { text: '💡 Hat… / Trägt…', tts: false },
}
```

- [ ] **DiktatModus.jsx** — mission: `'diktat-1'`

```js
const HINTS = {
  long:   { text: 'Hör dir den Satz nochmal genau an. Schreibe jeden Buchstaben einzeln. Nomen schreibt man groß!', tts: true },
  medium: { text: 'Nomen werden groß geschrieben. Höre nochmal hin.', tts: false },
  short:  { text: '💡 Nochmal anhören!', tts: false },
}
```

**Note for DiktatModus:** Das Spiel hat kein binäres `checked`-Konzept. Das Hint-System trotzdem einbauen, aber `shouldOfferHint` erst nach der ersten Fehleingabe anzeigen (nicht während der Aufnahme). Lies die Datei genau um den richtigen Einbaupunkt zu finden.

- [ ] **Step 5: Build + test**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/pages/app/games/WasFehlt.jsx src/pages/app/games/FalscherGegenstand.jsx src/pages/app/games/Personenbeschreibung.jsx src/pages/app/games/DiktatModus.jsx
git commit -m "feat: adaptive difficulty + hints + Ozzy in 4 remaining games (sprint 6)"
```

---

## Task 5: Build RegelRaupe — New Game

**Files:**
- Create: `src/pages/app/games/RegelRaupe.jsx`
- Create: `src/pages/app/games/RegelRaupe.module.css`

- [ ] **Step 1: Create `RegelRaupe.module.css`**

```css
/* src/pages/app/games/RegelRaupe.module.css */
.page {
  padding: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.wordCard {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin: 1rem 0;
}

.currentWord {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.03em;
  margin: 0 0 0.5rem;
}

.ruleHint {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 1.5rem;
}

.choiceRow {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.choiceBtn {
  flex: 1;
  max-width: 140px;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 2px solid transparent;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.12s, background 0.12s;
}
.choiceBtn:active {
  transform: scale(0.96);
}

.btnGross {
  background: #4f46e5;
  color: #fff;
}
.btnGross:hover {
  background: #4338ca;
}

.btnKlein {
  background: #e2e8f0;
  color: #334155;
}
.btnKlein:hover {
  background: #cbd5e1;
}

.choiceBtn:disabled {
  opacity: 0.6;
  cursor: default;
  transform: none;
}

.feedback {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}
.feedbackCorrect { color: #16a34a; }
.feedbackWrong   { color: #dc2626; }

.ruleTag {
  display: inline-block;
  margin-top: 0.35rem;
  padding: 0.2rem 0.65rem;
  background: #f1f5f9;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #475569;
}

.progress {
  margin: 1rem 0;
}

.progressBar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.progressFill {
  height: 100%;
  background: #10b981;
  border-radius: 999px;
  transition: width 0.3s;
}
.progressLabel {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.3rem;
  text-align: center;
}
```

- [ ] **Step 2: Create `RegelRaupe.jsx`**

```jsx
// src/pages/app/games/RegelRaupe.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { REGELRAUPE_SAETZE } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'
import gameStyles from './Game.module.css'
import styles from './RegelRaupe.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL_SENTENCES = 3

const HINTS = {
  long:   {
    text: 'Nomen sind Dinge, Personen, Tiere oder Orte → immer GROSS. Der erste Buchstabe im Satz ist immer GROSS. Verben und Adjektive → immer klein.',
    tts:  true,
  },
  medium: { text: 'Nomen = groß. Satzanfang = groß. Verben und Adjektive = klein.', tts: false },
  short:  { text: '💡 Nomen groß, Verb klein.', tts: false },
}

function getSentencePool(difficulty) {
  const pool = REGELRAUPE_SAETZE.filter((s) => s.difficulty === difficulty)
  return pool.length >= TOTAL_SENTENCES ? pool : REGELRAUPE_SAETZE
}

// Correct answer: word.text capitalized or not
function getCorrectForm(wordObj) {
  return wordObj.capitalize
    ? wordObj.text.charAt(0).toUpperCase() + wordObj.text.slice(1)
    : wordObj.text
}

export default function RegelRaupe() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['regel-raupe-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()

  const prevDiffRef = useRef(initialDifficulty)

  // sentences: 3 total, shuffled from difficulty pool
  const [sentences]         = useState(() => shuffle(getSentencePool(initialDifficulty)).slice(0, TOTAL_SENTENCES))
  const [sentIdx, setSentIdx]   = useState(0)
  const [wordIdx, setWordIdx]   = useState(0)
  const [wordResults, setWordResults] = useState([]) // { text, correct, chosen } per word
  const [lastFeedback, setLastFeedback] = useState(null) // 'correct' | 'wrong' | null
  const [sentScore, setSentScore]   = useState(0) // sentences with 0 mistakes
  const [phase, setPhase]   = useState('playing') // 'playing' | 'sentence-done' | 'result'

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const sentence  = sentences[sentIdx]
  const totalWords = sentence?.words.length ?? 0
  const progress   = totalWords > 0 ? (wordIdx / totalWords) * 100 : 0

  function handleChoice(capitalizeChoice) {
    const word    = sentence.words[wordIdx]
    const correct = word.capitalize === capitalizeChoice
    const chosen  = capitalizeChoice
      ? word.text.charAt(0).toUpperCase() + word.text.slice(1)
      : word.text

    if (correct) { playCorrect(); ozzReact('correct') }
    else         { playWrong();   ozzReact('wrong') }

    recordAnswer(correct)
    setLastFeedback(correct ? 'correct' : 'wrong')
    setWordResults((prev) => [...prev, { text: word.text, correct, chosen, rule: word.rule }])
    dismissHint()

    setTimeout(() => {
      setLastFeedback(null)
      if (wordIdx + 1 >= totalWords) {
        // Sentence complete — check if all words correct
        const allCorrect = [...wordResults, { correct }].every((r) => r.correct)
        if (allCorrect) setSentScore((s) => s + 1)
        setPhase('sentence-done')
      } else {
        setWordIdx((i) => i + 1)
      }
    }, 600)
  }

  function handleNextSentence() {
    if (sentIdx + 1 >= TOTAL_SENTENCES) {
      setPhase('result')
    } else {
      setSentIdx((i) => i + 1)
      setWordIdx(0)
      setWordResults([])
      setLastFeedback(null)
      dismissHint()
      setPhase('playing')
    }
  }

  async function handleFinish() {
    const xpEarned = sentScore * 15 + (sentScore === TOTAL_SENTENCES ? 5 : 0)
    const stars    = sentScore === TOTAL_SENTENCES ? 3 : sentScore >= 2 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'regel-raupe-1', xpEarned, stars, correct: sentScore, total: TOTAL_SENTENCES })
    navigate('/app')
  }

  // ── Result screen ──
  if (phase === 'result') {
    return (
      <div className={gameStyles.resultPage}>
        <div className={gameStyles.resultEmoji}>{sentScore === TOTAL_SENTENCES ? '🐛' : '⭐'}</div>
        <h1 className={gameStyles.resultTitle}>
          {sentScore === TOTAL_SENTENCES ? 'Regelmeister!' : 'Gut geübt!'}
        </h1>
        <p className={gameStyles.resultSub}>{sentScore}/{TOTAL_SENTENCES} Sätze fehlerlos</p>
        <div className={gameStyles.resultStats}>
          <Badge color="purple">+{sentScore * 15 + (sentScore === TOTAL_SENTENCES ? 5 : 0)} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(sentScore === TOTAL_SENTENCES ? 3 : sentScore >= 2 ? 2 : 1)}</Badge>
        </div>
        <div className={gameStyles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  // ── Sentence done — show results before next ──
  if (phase === 'sentence-done') {
    const allCorrect = wordResults.every((r) => r.correct)
    return (
      <div className={`${gameStyles.gamePage} fade-in`}>
        <div className={gameStyles.gameHeader}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
          <div className={gameStyles.gameInfo}>
            <span className={gameStyles.gameEmoji}>🐛</span>
            <h1 className={gameStyles.gameTitle}>RegelRaupe</h1>
          </div>
          <Badge color="gray">{sentIdx + 1}/{TOTAL_SENTENCES}</Badge>
        </div>

        <div className={styles.wordCard}>
          {allCorrect
            ? <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16a34a' }}>🎉 Fehlerlos!</p>
            : <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626' }}>Fast — ein paar Fehler:</p>
          }
          <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
            {wordResults.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                <span>{r.correct ? '✓' : '✗'}</span>
                <span style={{ color: r.correct ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {getCorrectForm(sentence.words[i])}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({sentence.words[i].rule})</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Button onClick={handleNextSentence} size="lg">
            {sentIdx + 1 >= TOTAL_SENTENCES ? 'Ergebnis' : 'Nächster Satz →'}
          </Button>
        </div>
      </div>
    )
  }

  // ── Playing ──
  if (!sentence) return null
  const currentWord = sentence.words[wordIdx]

  return (
    <div className={`${gameStyles.gamePage} fade-in`}>
      <div className={gameStyles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={gameStyles.gameInfo}>
          <span className={gameStyles.gameEmoji}>🐛</span>
          <h1 className={gameStyles.gameTitle}>RegelRaupe</h1>
        </div>
        <Badge color="gray">{sentIdx + 1}/{TOTAL_SENTENCES}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <div className={styles.wordCard}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.35rem' }}>
          Wort {wordIdx + 1} von {totalWords}
        </p>

        <p className={styles.currentWord}>{currentWord.text}</p>

        {hint ? (
          <div className={gameStyles.hintBox}>
            <p className={gameStyles.hintText}>{hint.text}</p>
            <button className={gameStyles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : shouldOfferHint(difficulty, wrongCount) && (
          <button className={gameStyles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        {lastFeedback === 'correct' && <p className={`${styles.feedback} ${styles.feedbackCorrect}`}>✓ Richtig!</p>}
        {lastFeedback === 'wrong'   && (
          <div>
            <p className={`${styles.feedback} ${styles.feedbackWrong}`}>✗ Falsch — es ist: <strong>{getCorrectForm(currentWord)}</strong></p>
            <span className={styles.ruleTag}>{currentWord.rule}</span>
          </div>
        )}

        <div className={styles.choiceRow}>
          <button
            className={`${styles.choiceBtn} ${styles.btnGross}`}
            onClick={() => handleChoice(true)}
            disabled={lastFeedback !== null}
          >
            🔼 Groß
          </button>
          <button
            className={`${styles.choiceBtn} ${styles.btnKlein}`}
            onClick={() => handleChoice(false)}
            disabled={lastFeedback !== null}
          >
            🔽 Klein
          </button>
        </div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.progressLabel}>Satz {sentIdx + 1}: {wordIdx}/{totalWords} Wörter</p>
      </div>
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
git add src/pages/app/games/RegelRaupe.jsx src/pages/app/games/RegelRaupe.module.css
git commit -m "feat: new RegelRaupe game — conditional grammar rules (sprint 6)"
```

---

## Task 6: Register RegelRaupe Route in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add lazy import and route**

In `src/App.jsx`, add lazy import after the existing game imports:
```js
const RegelRaupe = lazy(() => import('./pages/app/games/RegelRaupe.jsx'))
```

Add route inside `<Route path="/app" element={<AppLayout />}>`:
```jsx
<Route path="spiel/regel-raupe" element={<RegelRaupe />} />
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/App.jsx
git commit -m "feat: add RegelRaupe route to App.jsx (sprint 6)"
```

---

## Task 7: Difficulty Badge on DashboardPage Mission Cards

**Files:**
- Modify: `src/pages/app/DashboardPage.jsx`
- Modify: `src/pages/app/DashboardPage.module.css`

- [ ] **Step 1: Add difficulty badge to mission cards**

In `src/pages/app/DashboardPage.jsx`, first read the current file structure. Find where mission cards are rendered (the `<div className={styles.missionCard}>` or similar). Add the following badge logic just before the card's title or icon:

```jsx
{/* Difficulty badge — shows when game is in weakGames */}
{(weakGames[mission.id] ?? 0) > 0 && (
  <span className={styles.difficultyBadge}>🟢 Leicht-Modus aktiv</span>
)}
```

The `weakGames` is available via `useProgress()` — the component should already destructure it if Sprint 1 is merged. If not, add:
```js
const { weakGames } = useProgress()
```

- [ ] **Step 2: Add badge CSS to `DashboardPage.module.css`**

Append at end of file:
```css
/* Sprint 6: difficulty badge */
.difficultyBadge {
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
```

- [ ] **Step 3: Build + test**

```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds.

- [ ] **Step 4: Manual smoke test**

Navigate to `/app` with a profile that has `weakGames` entries. Verify the green badge appears on the corresponding mission cards.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/DashboardPage.jsx src/pages/app/DashboardPage.module.css
git commit -m "feat: difficulty badge on dashboard mission cards (sprint 6)"
```

---

## Done

Sprint 6 complete. Run final check:
```bash
npm test && npm run build
```

Expected: 9 tests passing, build succeeds, no ESLint errors.
