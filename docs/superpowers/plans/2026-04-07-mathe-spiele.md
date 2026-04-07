# Mathe-Spiele Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 math learning games (Zahlenstrahl, Mehr/Weniger, Minus-Rakete, Zahlenfolge, Würfel-Rechnen, Mini-Markt, Einmaleins-Blitz) behind a shared MathGameEngine component, reachable via a new Mathe tab on the dashboard.

**Architecture:** A shared `MathGameEngine` component handles level selection → 8 rounds → result screen. Each game file provides only `config`, `buildRounds`, `renderQuestion`, and `speakQuestion`. Dashboard gets a Deutsch/Mathe tab switcher under the Hero.

**Tech Stack:** React 18, React Router v6, CSS Modules, Vite, existing `useProgress` + `sounds.js` hooks.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/mathUtils.js` | CREATE | `randInt`, `shuffle`, `generateOptions` shared by all games |
| `src/components/game/MathGameEngine.module.css` | CREATE | Shared shell UI: level cards, progress, option buttons, feedback, result |
| `src/components/game/MathGameEngine.jsx` | CREATE | Full game loop: levelSelect → playing → result |
| `src/pages/app/DashboardPage.module.css` | MODIFY | Tab styles |
| `src/pages/app/DashboardPage.jsx` | MODIFY | Tab state, DeutschTab/MatheTab split, MATHE_GAME_ROUTES |
| `src/lib/gameData.js` | MODIFY | +21 mission entries (7 × 3 levels) |
| `src/App.jsx` | MODIFY | +7 lazy imports + routes under `/app/mathe/` |
| `src/pages/app/games/mathe/Zahlenstrahl.jsx` | CREATE | Number line gap game |
| `src/pages/app/games/mathe/MehrWeniger.jsx` | CREATE | Quantity comparison game |
| `src/pages/app/games/mathe/MinusRakete.jsx` | CREATE | Subtraction game |
| `src/pages/app/games/mathe/Zahlenfolge.jsx` | CREATE | Number sequence pattern game |
| `src/pages/app/games/mathe/WuerfelRechnen.jsx` | CREATE | Dice addition game |
| `src/pages/app/games/mathe/MiniMarkt.jsx` | CREATE | Euro price addition game |
| `src/pages/app/games/mathe/EinmaleinsBlitz.jsx` | CREATE | Multiplication game |

---

## Task 1: Shared Math Utilities

**Files:**
- Create: `src/lib/mathUtils.js`

- [ ] **Step 1.1: Create the utilities file**

```js
// src/lib/mathUtils.js

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
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
```

- [ ] **Step 1.2: Commit**

```bash
git add src/lib/mathUtils.js
git commit -m "feat: add shared mathUtils (randInt, shuffle, generateOptions)"
```

---

## Task 2: MathGameEngine CSS

**Files:**
- Create: `src/components/game/MathGameEngine.module.css`

- [ ] **Step 2.1: Create the CSS module**

```css
/* src/components/game/MathGameEngine.module.css */

/* ── Base ── */
.page {
  font-family: 'Nunito', 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 2.5rem;
  min-height: calc(100vh - 60px);
}

/* ── Header ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 8px;
}

.backBtn {
  background: #fff;
  border: 2.5px solid #e2e8f0;
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: transform 0.12s;
}
.backBtn:hover { transform: scale(1.08); }
.backBtn:active { transform: scale(0.94); }

.title {
  font-size: 1.25rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.3px;
}

.subtitle {
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-muted);
  margin: 0 16px 4px;
  font-weight: 700;
}

.badge {
  font-size: 0.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 999px;
  padding: 5px 14px;
  border: 2px solid #fcd34d;
  box-shadow: 0 2px 6px rgba(251,191,36,0.3);
}

.speakBtn {
  background: #fff;
  border: 2.5px solid #e2e8f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: transform 0.12s;
}
.speakBtn:hover { transform: scale(1.1); }
.speakBtn:active { transform: scale(0.92); }

/* ── Level Select ── */
.levelGrid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 16px 0;
}

.levelCard {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  font-family: 'Nunito', inherit;
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
  overflow: hidden;
  text-align: left;
}
.levelCard:hover { transform: translateY(-3px); }
.levelCard:active { transform: scale(0.97); }

.lv1 { background: linear-gradient(135deg, #34d399, #10b981); box-shadow: 0 6px 20px rgba(16,185,129,0.35); }
.lv2 { background: linear-gradient(135deg, #fbbf24, #f59e0b); box-shadow: 0 6px 20px rgba(245,158,11,0.35); }
.lv3 { background: linear-gradient(135deg, #f87171, #ef4444); box-shadow: 0 6px 20px rgba(239,68,68,0.35); }

.lvStars { font-size: 2rem; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }
.lvInfo  { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.lvTitle { font-size: 1.15rem; font-weight: 900; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.lvLabel { font-size: 0.82rem; font-weight: 800; color: rgba(255,255,255,0.85); }
.lvArrow { font-size: 1.4rem; color: rgba(255,255,255,0.7); font-weight: 900; flex-shrink: 0; }

/* ── Progress ── */
.progressWrap { padding: 0 16px 12px; }
.progressBar  { height: 12px; border-radius: 999px; background: #e2e8f0; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
.progressFill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #34d399, #10b981); transition: width 0.45s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 2px 6px rgba(16,185,129,0.4); }
.progressLabel { font-size: 0.72rem; color: var(--text-muted); text-align: right; margin-top: 5px; font-weight: 800; }

/* ── Question Box ── */
.questionBox {
  margin: 0 16px;
  background: linear-gradient(145deg, #f8faff, #f1f5ff);
  border-radius: 28px;
  padding: 24px 16px;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e0e7ff;
  box-shadow: 0 4px 20px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
}

/* ── Question Text ── */
.question {
  font-size: 1.1rem;
  font-weight: 800;
  text-align: center;
  margin: 14px 16px 10px;
  line-height: 1.4;
  color: var(--text);
}
.question strong { color: #4f46e5; font-weight: 900; }

/* ── Option Buttons ── */
.optionGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px;
}

.optionBtn {
  border-radius: 22px;
  border: 3px solid #e2e8f0;
  background: #fff;
  padding: 20px 10px;
  font-size: 1.6rem;
  font-weight: 900;
  font-family: 'Nunito', inherit;
  min-height: 72px;
  cursor: pointer;
  transition: transform 0.12s, border-color 0.12s, box-shadow 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 #e2e8f0, 0 2px 8px rgba(0,0,0,0.06);
  color: var(--text);
}
.optionBtn:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: #818cf8;
  box-shadow: 0 6px 0 #c7d2fe, 0 4px 16px rgba(99,102,241,0.2);
}
.optionBtn:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 2px 0 #e2e8f0; }
.optionBtn:disabled { cursor: default; }

.optCorrect {
  border-color: #22c55e !important;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
  color: #14532d !important;
  box-shadow: 0 4px 0 #86efac, 0 4px 16px rgba(34,197,94,0.25) !important;
  transform: scale(1.04) !important;
}
.optWrong {
  border-color: #ef4444 !important;
  background: linear-gradient(135deg, #fee2e2, #fecaca) !important;
  color: #7f1d1d !important;
  box-shadow: 0 4px 0 #fca5a5 !important;
}

/* ── Feedback ── */
.feedback {
  margin: 12px 16px 0;
  border-radius: 18px;
  padding: 14px 18px;
  font-weight: 800;
  font-size: 0.92rem;
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.4;
  animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.feedbackGreen { background: linear-gradient(135deg,#dcfce7,#bbf7d0); color:#14532d; border:2px solid #86efac; }
.feedbackRed   { background: linear-gradient(135deg,#fee2e2,#fecaca); color:#7f1d1d; border:2px solid #fca5a5; }

/* ── Primary Button ── */
.primaryBtn {
  border: none;
  border-radius: 18px;
  padding: 17px;
  font-weight: 900;
  font-size: 1rem;
  font-family: 'Nunito', inherit;
  width: calc(100% - 32px);
  margin: 12px 16px 0;
  cursor: pointer;
  color: #fff;
  transition: transform 0.12s, box-shadow 0.12s;
  letter-spacing: 0.3px;
}
.primaryBtn:hover { transform: translateY(-2px); }
.primaryBtn:active { transform: translateY(1px); }
.greenBtn { background: linear-gradient(135deg,#34d399,#10b981); box-shadow: 0 4px 0 #059669, 0 4px 16px rgba(16,185,129,0.3); }
.greenBtn:hover { box-shadow: 0 6px 0 #059669, 0 6px 20px rgba(16,185,129,0.35); }
.greenBtn:active { box-shadow: 0 2px 0 #059669; }
.grayBtn { background: linear-gradient(135deg,#94a3b8,#64748b); box-shadow: 0 4px 0 #475569, 0 4px 12px rgba(100,116,139,0.25); }

/* ── Result ── */
.result {
  display: flex; flex-direction: column; align-items: center;
  gap: 1rem; padding: 2.5rem 1.5rem; text-align: center;
}
.resultEmoji { font-size: 5.5rem; animation: resultBounce 0.6s cubic-bezier(0.34,1.56,0.64,1); filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15)); }
@keyframes resultBounce {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
  100% { transform: scale(1)   rotate(0deg); }
}
.resultTitle {
  font-size: 1.9rem; font-weight: 900; margin: 0; letter-spacing: -0.5px;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.resultScore { font-size: 1rem; color: var(--text-muted); margin: 0; font-weight: 800; }
.resultStars { font-size: 2.8rem; animation: starsIn 0.4s 0.2s cubic-bezier(0.34,1.56,0.64,1) both; filter: drop-shadow(0 4px 8px rgba(251,191,36,0.4)); }
@keyframes starsIn {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
.resultActions { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.resultActions .primaryBtn { margin: 0; width: 100%; }
```

- [ ] **Step 2.2: Commit**

```bash
git add src/components/game/MathGameEngine.module.css
git commit -m "feat: add MathGameEngine CSS module"
```

---

## Task 3: MathGameEngine Component

**Files:**
- Create: `src/components/game/MathGameEngine.jsx`

- [ ] **Step 3.1: Create the component**

```jsx
// src/components/game/MathGameEngine.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete, speak } from '../../lib/sounds.js'
import styles from './MathGameEngine.module.css'

function calcStars(score, total) {
  if (score === total) return 3
  if (score >= Math.ceil(total * 0.7)) return 2
  return 1
}

/**
 * Shared game engine for all math games.
 *
 * Props:
 *   gameTitle      string           Display title, e.g. "Zahlenstrahl 🔢"
 *   config         object           { 1: {min,max,rounds,missionId,label}, 2:{…}, 3:{…} }
 *   buildRounds    function         (level, cfg) => Round[]  — each Round must have .options and .answer
 *   renderQuestion function         (round) => JSX           — renders the question display
 *   speakQuestion  function         (round) => string        — returns TTS string
 *   formatOption   function         (opt) => string          — optional, default String(opt)
 */
export default function MathGameEngine({
  gameTitle,
  config,
  buildRounds,
  renderQuestion,
  speakQuestion,
  formatOption = String,
}) {
  const navigate = useNavigate()
  const { completeSession } = useProgress()

  const [phase,    setPhase]    = useState('levelSelect')
  const [level,    setLevel]    = useState(null)
  const [rounds,   setRounds]   = useState([])
  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)

  const cfg   = level ? config[level] : null
  const round = rounds[idx]
  const TOTAL = rounds.length

  useEffect(() => {
    if (phase === 'playing' && round && speakQuestion) {
      speak(speakQuestion(round))
    }
  }, [round, phase])

  function startLevel(lvl) {
    setLevel(lvl)
    setRounds(buildRounds(lvl, config[lvl]))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setPhase('playing')
  }

  function handleSelect(opt) {
    if (selected !== null) return
    setSelected(opt)
    if (opt === round.answer) { playCorrect(); setScore(s => s + 1) }
    else playWrong()
  }

  function handleWeiter() {
    // NOTE: `score` here already reflects the last correct answer.
    // React commits setScore (called in handleSelect) before the user can click Weiter,
    // so handleWeiter's closure has the up-to-date value. Do NOT add lastCorrect.
    if (idx + 1 >= TOTAL) {
      playComplete()
      const stars = calcStars(score, TOTAL)
      completeSession({ missionId: cfg.missionId, xpEarned: score * 2 + 5, stars })
      setPhase('result')
    } else {
      setIdx(i => i + 1)
      setSelected(null)
    }
  }

  // ── Level Select ─────────────────────────────────────────────────────────
  if (phase === 'levelSelect') {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/app')}>←</button>
          <h1 className={styles.title}>{gameTitle}</h1>
          <div />
        </div>
        <p className={styles.subtitle}>Wähle dein Level!</p>
        <div className={styles.levelGrid}>
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              className={`${styles.levelCard} ${styles[`lv${lvl}`]}`}
              onClick={() => startLevel(lvl)}
            >
              <span className={styles.lvStars}>{'⭐'.repeat(lvl)}</span>
              <div className={styles.lvInfo}>
                <span className={styles.lvTitle}>Level {lvl}</span>
                <span className={styles.lvLabel}>{config[lvl].label}</span>
              </div>
              <span className={styles.lvArrow}>›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Result ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = calcStars(score, TOTAL)
    return (
      <div className={styles.page}>
        <div className={styles.result}>
          <div className={styles.resultEmoji}>
            {stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}
          </div>
          <h2 className={styles.resultTitle}>
            {stars === 3 ? 'Perfekt!' : stars === 2 ? 'Super gemacht!' : 'Weiter üben!'}
          </h2>
          <p className={styles.resultScore}>{score} von {TOTAL} richtig</p>
          <div className={styles.resultStars}>{'⭐'.repeat(stars)}</div>
          <div className={styles.resultActions}>
            <button
              className={`${styles.primaryBtn} ${styles.greenBtn}`}
              onClick={() => startLevel(level)}
            >
              Nochmal spielen
            </button>
            <button
              className={`${styles.primaryBtn} ${styles.grayBtn}`}
              onClick={() => navigate('/app')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => setPhase('levelSelect')}>←</button>
        <span className={styles.badge}>{gameTitle} · L{level}</span>
        <button
          className={styles.speakBtn}
          onClick={() => speak(speakQuestion(round))}
        >🔊</button>
      </div>

      {/* Progress */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(idx / TOTAL) * 100}%` }} />
        </div>
        <div className={styles.progressLabel}>{idx + 1} / {TOTAL}</div>
      </div>

      {/* Question display (game-specific) */}
      <div className={`${styles.questionBox} ${selected !== null ? (selected === round.answer ? 'bounce' : 'shake') : ''}`}>
        {renderQuestion(round)}
      </div>

      {/* Option buttons */}
      <div className={styles.optionGrid}>
        {round.options.map((opt) => {
          let cls = styles.optionBtn
          if (selected !== null) {
            if (opt === round.answer)   cls += ' ' + styles.optCorrect
            else if (opt === selected)  cls += ' ' + styles.optWrong
          }
          return (
            <button
              key={String(opt)}
              className={cls}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
            >
              {formatOption(opt)}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <>
          <div className={`${styles.feedback} ${selected === round.answer ? styles.feedbackGreen : styles.feedbackRed}`}>
            <span>{selected === round.answer ? '✅' : '❌'}</span>
            <span>
              {selected === round.answer
                ? 'Richtig! 🎉'
                : `Richtig wäre: ${formatOption(round.answer)}`}
            </span>
          </div>
          <button
            className={`${styles.primaryBtn} ${styles.greenBtn}`}
            onClick={handleWeiter}
          >
            {idx + 1 >= TOTAL ? 'Ergebnis ansehen 🏆' : 'Weiter →'}
          </button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3.2: Verify — add a temporary test route**

Open `src/App.jsx` and temporarily add at the top of lazy imports:
```jsx
const TestEngine = lazy(() => import('./components/game/MathGameEngine.jsx'))
```
And a temp route: `<Route path="mathe/test" element={<TestEngine gameTitle="Test 🔢" config={{1:{min:1,max:5,rounds:2,missionId:'test',label:'Test'},2:{min:1,max:10,rounds:2,missionId:'test2',label:'Test2'},3:{min:1,max:20,rounds:2,missionId:'test3',label:'Test3'}}} buildRounds={(l,c)=>[{options:[1,2,3,4],answer:2},{options:[3,4,5,6],answer:5}]} renderQuestion={(r)=><div style={{fontSize:'2rem'}}>Tippe {r.answer}!</div>} speakQuestion={()=>'Test'} />} />` — navigate to `http://localhost:5173/app/mathe/test` and play through both rounds.

- [ ] **Step 3.3: Remove the temporary test route from App.jsx after verification**

- [ ] **Step 3.4: Commit**

```bash
git add src/components/game/MathGameEngine.jsx
git commit -m "feat: add MathGameEngine shared component"
```

---

## Task 4: Dashboard Tab Styles

**Files:**
- Modify: `src/pages/app/DashboardPage.module.css`

- [ ] **Step 4.1: Add tab CSS to the end of DashboardPage.module.css**

```css
/* ── Tabs ── */
.tabs {
  display: flex;
  border-bottom: 2.5px solid var(--border);
  margin: 0 0 4px;
  padding: 0 4px;
  gap: 4px;
}

.tab {
  flex: 1;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2.5px;
  padding: 12px 8px;
  font-size: 0.95rem;
  font-weight: 800;
  font-family: inherit;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tab:hover { color: var(--text); }

.tabActive {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
```

- [ ] **Step 4.2: Commit**

```bash
git add src/pages/app/DashboardPage.module.css
git commit -m "feat: add Deutsch/Mathe tab styles to dashboard"
```

---

## Task 5: Dashboard Tabs — Component Update

**Files:**
- Modify: `src/pages/app/DashboardPage.jsx`

- [ ] **Step 5.1: Add MATHE_GAME_ROUTES and activeTab state**

At the top of `DashboardPage.jsx`, after the existing `GAME_ROUTES` constant, add:

```jsx
const MATHE_GAME_ROUTES = {
  zahlenstrahl:    '/app/mathe/zahlenstrahl',
  mehrWeniger:     '/app/mathe/mehr-weniger',
  minusRakete:     '/app/mathe/minus-rakete',
  zahlenfolge:     '/app/mathe/zahlenfolge',
  wuerfelRechnen:  '/app/mathe/wuerfel-rechnen',
  miniMarkt:       '/app/mathe/mini-markt',
  einmaleinsBlitz: '/app/mathe/einmaleins',
}
```

And update the import line to add `useState`:
```jsx
import React, { useMemo, useState } from 'react'
```

- [ ] **Step 5.2: Add MatheTab game data constants**

After `MODULE_META`, add:

```jsx
const MATHE_LEVEL_META = {
  kindergarten: {
    0: { label: 'Meine Mathe-Spiele', emoji: '🔢', color: '#6366f1' },
  },
  volksschule: {
    0: { label: 'Zahlen & Zählen',  emoji: '🔢', color: '#6366f1' },
    1: { label: 'Rechnen',           emoji: '➕', color: '#f97316' },
    2: { label: 'Profi-Rechnen',     emoji: '✖️', color: '#ef4444' },
  },
  hauptschule: {
    0: { label: 'Aufwärmen',         emoji: '🔢', color: '#6366f1' },
    1: { label: 'Grundrechnen',      emoji: '➕', color: '#f97316' },
    2: { label: 'Mittelstufe',       emoji: '✖️', color: '#ef4444' },
  },
}

// Math missions imported from MISSIONS — same level system
const MATHE_TYPES = new Set([
  'zahlenstrahl','mehrWeniger','minusRakete',
  'zahlenfolge','wuerfelRechnen','miniMarkt','einmaleinsBlitz',
])

function getUniqueMatheGames(level, completed) {
  const seen = new Set()
  const unique = []
  for (const m of MISSIONS) {
    if (m.level !== level || !MATHE_TYPES.has(m.type)) continue
    if (seen.has(m.type)) continue
    seen.add(m.type)
    const variants = MISSIONS.filter((v) => v.level === level && v.type === m.type)
    const completedCount = variants.filter((v) => completed.includes(v.id)).length
    unique.push({ ...m, variants, completedCount })
  }
  return unique
}
```

- [ ] **Step 5.3: Add activeTab state inside DashboardPage component**

Inside the `DashboardPage` function, after existing derived values, add:

```jsx
const [activeTab, setActiveTab] = useState('deutsch')

const mathedLeveledGames = useMemo(
  () => Object.fromEntries(allowedLevels.map((lvl) => [lvl, getUniqueMatheGames(lvl, completed)])),
  [allowedLevels, completed],
)
```

- [ ] **Step 5.4: Wrap the existing game grid in a DeutschTab block and add MatheTab**

In the JSX, after the `{/* ── Tagesaufgabe ── */}` section, replace the level map section:

Find this line:
```jsx
      {/* ── Spiele nach Kategorie ── */}
      {allowedLevels.map((lvl) => {
```

Replace with:
```jsx
      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'deutsch' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('deutsch')}
        >📚 Deutsch</button>
        <button
          className={`${styles.tab} ${activeTab === 'mathe' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('mathe')}
        >🔢 Mathe</button>
      </div>

      {/* ── Deutsch Tab ── */}
      {activeTab === 'deutsch' && allowedLevels.map((lvl) => {
```

And close the map with `)}` then add the Mathe tab block.

After the closing `})}` of the level map and the Hauptschule "Kommt bald" section, add:

```jsx
      {/* ── Mathe Tab ── */}
      {activeTab === 'mathe' && (
        <>
          {allowedLevels.map((lvl) => {
            const games = mathedLeveledGames[lvl]
            if (!games.length) return null
            const meta = (MATHE_LEVEL_META[schoolModule] ?? MATHE_LEVEL_META.volksschule)[lvl]
                      ?? { label: `Level ${lvl}`, emoji: '🔢', color: '#6366f1' }
            const totalVariants = games.reduce((s, g) => s + g.variants.length, 0)
            const doneVariants  = games.reduce((s, g) => s + g.completedCount, 0)
            return (
              <section key={lvl}>
                <div className={styles.levelHeader}>
                  <div className={styles.levelPill} style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}40` }}>
                    <span>{meta.emoji}</span>
                    <span style={{ color: meta.color, fontWeight: 800 }}>{meta.label}</span>
                  </div>
                  <span className={styles.levelProgress}>{doneVariants}/{totalVariants} erledigt</span>
                </div>
                <div className={styles.gameGrid}>
                  {games.map((g) => {
                    const route = MATHE_GAME_ROUTES[g.type]
                    const anyDone = g.completedCount > 0
                    const allDone = g.completedCount >= g.variants.length
                    return (
                      <Link key={g.type} to={route} className={styles.gameLink}>
                        <div
                          className={`${styles.gameCard} ${allDone ? styles.gameCardDone : anyDone ? styles.gameCardPartial : ''}`}
                          style={{ '--accent': g.color }}
                        >
                          <div className={styles.gameIconBig}>{g.icon}</div>
                          <div className={styles.gameTitle}>{g.title}</div>
                          {g.variants.length > 1 && (
                            <div className={styles.diffDots}>
                              {g.variants.map((v, i) => (
                                <div
                                  key={v.id}
                                  className={`${styles.diffDot} ${completed.includes(v.id) ? styles.diffDotDone : ''}`}
                                  title={`Level ${i + 1}: ${completed.includes(v.id) ? 'gespielt' : 'offen'}`}
                                />
                              ))}
                            </div>
                          )}
                          <div className={styles.gameCardMeta}>
                            <span className={styles.gameXp}>+{g.xp} XP</span>
                          </div>
                          <div className={`${styles.gamePlayBtn} ${allDone ? styles.gameDoneBtn : anyDone ? styles.gamePartialBtn : ''}`}>
                            {allDone ? '✓ Alle gespielt' : anyDone ? `${g.completedCount}/${g.variants.length} gespielt` : '▶ Spielen'}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
          {(!mathedLeveledGames[0]?.length && !mathedLeveledGames[1]?.length && !mathedLeveledGames[2]?.length) && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>
              Mathe-Spiele werden gleich geladen...
            </div>
          )}
        </>
      )}
```

- [ ] **Step 5.5: Verify dashboard loads without errors**

Navigate to `http://localhost:5173/app` — both tabs should appear under the Hero. Deutsch tab shows existing games. Mathe tab shows empty state (games not yet in gameData.js).

- [ ] **Step 5.6: Commit**

```bash
git add src/pages/app/DashboardPage.jsx src/pages/app/DashboardPage.module.css
git commit -m "feat: add Deutsch/Mathe tab switcher to dashboard"
```

---

## Task 6: Add 21 Missions to gameData.js

**Files:**
- Modify: `src/lib/gameData.js`

- [ ] **Step 6.1: Append 21 mission entries to the MISSIONS array**

Find the end of the `MISSIONS` array (just before the closing `]`) and add:

```js
  // ── Mathe-Spiele ──────────────────────────────────────────────────────

  // Zahlenstrahl (Level 0 = Kindergarten, all modules)
  { id: 'zahlenstrahl-1', type: 'zahlenstrahl', title: 'Zahlenstrahl', description: 'Welche Zahl fehlt?',       icon: '🔢', xp: 10, stars: 0, level: 0, color: '#6366f1' },
  { id: 'zahlenstrahl-2', type: 'zahlenstrahl', title: 'Zahlenstrahl', description: 'Lücken auf dem Strahl!',   icon: '🔢', xp: 14, stars: 0, level: 0, color: '#6366f1' },
  { id: 'zahlenstrahl-3', type: 'zahlenstrahl', title: 'Zahlenstrahl', description: 'Zahlenreihe meistern!',    icon: '🔢', xp: 18, stars: 0, level: 0, color: '#6366f1' },

  // Mehr oder Weniger (Level 0)
  { id: 'mehrWeniger-1', type: 'mehrWeniger', title: 'Mehr oder Weniger', description: 'Was ist mehr?',         icon: '⚖️', xp: 10, stars: 0, level: 0, color: '#06b6d4' },
  { id: 'mehrWeniger-2', type: 'mehrWeniger', title: 'Mehr oder Weniger', description: 'Größer, kleiner, gleich?', icon: '⚖️', xp: 14, stars: 0, level: 0, color: '#06b6d4' },
  { id: 'mehrWeniger-3', type: 'mehrWeniger', title: 'Mehr oder Weniger', description: 'Mengen vergleichen!',   icon: '⚖️', xp: 18, stars: 0, level: 0, color: '#06b6d4' },

  // Würfel-Rechnen (Level 0)
  { id: 'wuerfelRechnen-1', type: 'wuerfelRechnen', title: 'Würfel-Rechnen', description: 'Zähle die Punkte!', icon: '🎲', xp: 10, stars: 0, level: 0, color: '#10b981' },
  { id: 'wuerfelRechnen-2', type: 'wuerfelRechnen', title: 'Würfel-Rechnen', description: 'Zwei Würfel addieren!', icon: '🎲', xp: 14, stars: 0, level: 0, color: '#10b981' },
  { id: 'wuerfelRechnen-3', type: 'wuerfelRechnen', title: 'Würfel-Rechnen', description: 'Würfel-Profi!',      icon: '🎲', xp: 18, stars: 0, level: 0, color: '#10b981' },

  // Minus-Rakete (Level 1)
  { id: 'minusRakete-1', type: 'minusRakete', title: 'Minus-Rakete', description: 'Was bleibt übrig?',          icon: '🚀', xp: 10, stars: 0, level: 1, color: '#f97316' },
  { id: 'minusRakete-2', type: 'minusRakete', title: 'Minus-Rakete', description: 'Subtraktion üben!',          icon: '🚀', xp: 14, stars: 0, level: 1, color: '#f97316' },
  { id: 'minusRakete-3', type: 'minusRakete', title: 'Minus-Rakete', description: 'Minus-Meister!',             icon: '🚀', xp: 18, stars: 0, level: 1, color: '#f97316' },

  // Zahlenfolge (Level 1)
  { id: 'zahlenfolge-1', type: 'zahlenfolge', title: 'Zahlenfolge', description: 'Was kommt als nächstes?',     icon: '🔗', xp: 10, stars: 0, level: 1, color: '#8b5cf6' },
  { id: 'zahlenfolge-2', type: 'zahlenfolge', title: 'Zahlenfolge', description: 'Muster erkennen!',            icon: '🔗', xp: 14, stars: 0, level: 1, color: '#8b5cf6' },
  { id: 'zahlenfolge-3', type: 'zahlenfolge', title: 'Zahlenfolge', description: 'Zahlenreihen-Profi!',         icon: '🔗', xp: 18, stars: 0, level: 1, color: '#8b5cf6' },

  // Mini-Markt (Level 2)
  { id: 'miniMarkt-1', type: 'miniMarkt', title: 'Mini-Markt', description: 'Was kostet alles zusammen?',       icon: '🛒', xp: 10, stars: 0, level: 2, color: '#f59e0b' },
  { id: 'miniMarkt-2', type: 'miniMarkt', title: 'Mini-Markt', description: 'Preise addieren!',                 icon: '🛒', xp: 14, stars: 0, level: 2, color: '#f59e0b' },
  { id: 'miniMarkt-3', type: 'miniMarkt', title: 'Mini-Markt', description: 'Einkaufs-Profi!',                  icon: '🛒', xp: 18, stars: 0, level: 2, color: '#f59e0b' },

  // Einmaleins-Blitz (Level 2)
  { id: 'einmaleinsBlitz-1', type: 'einmaleinsBlitz', title: 'Einmaleins-Blitz', description: 'Mal-Aufgaben lösen!',   icon: '✖️', xp: 10, stars: 0, level: 2, color: '#ef4444' },
  { id: 'einmaleinsBlitz-2', type: 'einmaleinsBlitz', title: 'Einmaleins-Blitz', description: 'Schnell multiplizieren!', icon: '✖️', xp: 14, stars: 0, level: 2, color: '#ef4444' },
  { id: 'einmaleinsBlitz-3', type: 'einmaleinsBlitz', title: 'Einmaleins-Blitz', description: 'Einmaleins-Meister!',    icon: '✖️', xp: 18, stars: 0, level: 2, color: '#ef4444' },
```

- [ ] **Step 6.2: Verify — navigate to `http://localhost:5173/app`, click Mathe tab**

Games should now appear in the Mathe tab grouped by level (Level 0: Zahlenstrahl, Mehr/Weniger, Würfel-Rechnen; Level 1: Minus-Rakete, Zahlenfolge; Level 2: Mini-Markt, Einmaleins-Blitz). Links go to 404 — that's expected until routes are added.

- [ ] **Step 6.3: Commit**

```bash
git add src/lib/gameData.js
git commit -m "feat: add 21 mathe missions to gameData"
```

---

## Task 7: App.jsx — Add 7 Routes

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 7.1: Add lazy imports after the existing FruechtZaehlen import**

```jsx
const Zahlenstrahl    = lazy(() => import('./pages/app/games/mathe/Zahlenstrahl.jsx'))
const MehrWeniger     = lazy(() => import('./pages/app/games/mathe/MehrWeniger.jsx'))
const MinusRakete     = lazy(() => import('./pages/app/games/mathe/MinusRakete.jsx'))
const Zahlenfolge     = lazy(() => import('./pages/app/games/mathe/Zahlenfolge.jsx'))
const WuerfelRechnen  = lazy(() => import('./pages/app/games/mathe/WuerfelRechnen.jsx'))
const MiniMarkt       = lazy(() => import('./pages/app/games/mathe/MiniMarkt.jsx'))
const EinmaleinsBlitz = lazy(() => import('./pages/app/games/mathe/EinmaleinsBlitz.jsx'))
```

- [ ] **Step 7.2: Add routes inside the `/app` Route block, after the last `spiel/` route**

```jsx
<Route path="mathe/zahlenstrahl"    element={<Zahlenstrahl />} />
<Route path="mathe/mehr-weniger"    element={<MehrWeniger />} />
<Route path="mathe/minus-rakete"    element={<MinusRakete />} />
<Route path="mathe/zahlenfolge"     element={<Zahlenfolge />} />
<Route path="mathe/wuerfel-rechnen" element={<WuerfelRechnen />} />
<Route path="mathe/mini-markt"      element={<MiniMarkt />} />
<Route path="mathe/einmaleins"      element={<EinmaleinsBlitz />} />
```

- [ ] **Step 7.3: Commit (routes will 404 until game files are created — that's fine)**

```bash
git add src/App.jsx
git commit -m "feat: add 7 mathe game routes to App.jsx"
```

---

## Task 8: Zahlenstrahl

**Files:**
- Create: `src/pages/app/games/mathe/Zahlenstrahl.jsx`

- [ ] **Step 8.1: Create the game file**

```jsx
// src/pages/app/games/mathe/Zahlenstrahl.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, shuffle, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 1,  max: 10, rounds: 8, missionId: 'zahlenstrahl-1', label: 'Zahlen 1–10' },
  2: { min: 1,  max: 20, rounds: 8, missionId: 'zahlenstrahl-2', label: 'Zahlen 1–20' },
  3: { min: 5,  max: 50, rounds: 8, missionId: 'zahlenstrahl-3', label: 'Zahlen bis 50' },
}

function buildRounds(level, cfg) {
  const seqLen = level === 1 ? 5 : level === 2 ? 6 : 7
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const start = randInt(cfg.min, cfg.max - seqLen + 1)
    const seq   = Array.from({ length: seqLen }, (_, k) => start + k)
    const gapIdx = randInt(1, seqLen - 2)           // never first or last
    const answer = seq[gapIdx]
    const sequence = seq.map((n, k) => (k === gapIdx ? null : n))
    const options  = generateOptions(answer, Math.max(cfg.min, answer - 4), Math.min(cfg.max, answer + 4))
    rounds.push({ sequence, gapIdx, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
      {round.sequence.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: n === null ? '#6366f1' : '#e0e7ff',
            color: n === null ? '#fff' : '#3730a3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: n === null ? '1.3rem' : '1rem',
            border: n === null ? '3px solid #4f46e5' : '2px solid #c7d2fe',
            boxShadow: n === null ? '0 2px 8px rgba(99,102,241,0.4)' : 'none',
          }}>
            {n === null ? '?' : n}
          </div>
          {i < round.sequence.length - 1 && (
            <span style={{ color: '#94a3b8', fontWeight: 900, fontSize: '1.1rem' }}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Zahlenstrahl() {
  return (
    <MathGameEngine
      gameTitle="Zahlenstrahl 🔢"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(r) => `Welche Zahl fehlt in der Reihe?`}
    />
  )
}
```

- [ ] **Step 8.2: Verify at `http://localhost:5173/app/mathe/zahlenstrahl`**

Level select shows 3 cards. Clicking Level 1 starts the game. Number line displays with `?` bubble. Selecting the correct answer highlights green, wrong answer highlights red. After 8 rounds, result screen appears.

- [ ] **Step 8.3: Commit**

```bash
git add src/pages/app/games/mathe/Zahlenstrahl.jsx
git commit -m "feat: add Zahlenstrahl game"
```

---

## Task 9: MehrWeniger

**Files:**
- Create: `src/pages/app/games/mathe/MehrWeniger.jsx`

- [ ] **Step 9.1: Create the game file**

```jsx
// src/pages/app/games/mathe/MehrWeniger.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 1,  max: 10, rounds: 8, missionId: 'mehrWeniger-1', label: 'Zahlen 1–10' },
  2: { min: 1,  max: 20, rounds: 8, missionId: 'mehrWeniger-2', label: 'Zahlen 1–20' },
  3: { min: 5,  max: 50, rounds: 8, missionId: 'mehrWeniger-3', label: 'Zahlen bis 50' },
}

function buildRounds(level, cfg) {
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    // Distribute: 3 '>' rounds, 3 '<' rounds, 2 '=' rounds per 8
    const type = i < 3 ? 'gt' : i < 6 ? 'lt' : 'eq'
    const left = randInt(cfg.min, cfg.max)
    let right
    if (type === 'eq') right = left
    else if (type === 'gt') right = randInt(cfg.min, Math.max(cfg.min, left - 1))
    else right = randInt(Math.min(left + 1, cfg.max), cfg.max)
    const answer = left > right ? '>' : left < right ? '<' : '='
    rounds.push({ left, right, options: ['>', '<', '='], answer })
  }
  return rounds
}

function renderQuestion(round) {
  const bubbleStyle = (count) => ({
    display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center',
    maxWidth: 120,
  })
  const dotStyle = { fontSize: count => count > 15 ? '1rem' : '1.4rem' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={bubbleStyle(round.left)}>
          {Array.from({ length: Math.min(round.left, 20) }, (_, i) => (
            <span key={i} style={{ fontSize: round.left > 15 ? '1rem' : '1.4rem' }}>🔵</span>
          ))}
          {round.left > 20 && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>+{round.left - 20}</span>}
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.5rem', marginTop: 6 }}>{round.left}</div>
      </div>
      <div style={{ fontSize: '2.5rem', color: '#94a3b8', fontWeight: 900 }}>?</div>
      <div style={{ textAlign: 'center' }}>
        <div style={bubbleStyle(round.right)}>
          {Array.from({ length: Math.min(round.right, 20) }, (_, i) => (
            <span key={i} style={{ fontSize: round.right > 15 ? '1rem' : '1.4rem' }}>🟠</span>
          ))}
          {round.right > 20 && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>+{round.right - 20}</span>}
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.5rem', marginTop: 6 }}>{round.right}</div>
      </div>
    </div>
  )
}

export default function MehrWeniger() {
  return (
    <MathGameEngine
      gameTitle="Mehr oder Weniger ⚖️"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(r) => `Ist ${r.left} größer, kleiner oder gleich ${r.right}?`}
    />
  )
}
```

- [ ] **Step 9.2: Verify at `http://localhost:5173/app/mathe/mehr-weniger`**

Two groups of dots appear with a `?` between them. Options show `>`, `<`, `=`. Selecting the correct symbol highlights green.

- [ ] **Step 9.3: Commit**

```bash
git add src/pages/app/games/mathe/MehrWeniger.jsx
git commit -m "feat: add Mehr-oder-Weniger game"
```

---

## Task 10: MinusRakete

**Files:**
- Create: `src/pages/app/games/mathe/MinusRakete.jsx`

- [ ] **Step 10.1: Create the game file**

```jsx
// src/pages/app/games/mathe/MinusRakete.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 1, max: 5,  rounds: 8, missionId: 'minusRakete-1', label: 'bis 10' },
  2: { min: 1, max: 10, rounds: 8, missionId: 'minusRakete-2', label: 'bis 20' },
  3: { min: 2, max: 20, rounds: 8, missionId: 'minusRakete-3', label: 'bis 50' },
}

function buildRounds(level, cfg) {
  const rounds = []
  const maxA = level === 1 ? 10 : level === 2 ? 20 : 50
  for (let i = 0; i < cfg.rounds; i++) {
    const b      = randInt(cfg.min, cfg.max)
    const answer = randInt(1, maxA - b)
    const a      = b + answer
    const options = generateOptions(answer, 1, Math.max(a - 1, answer + 3))
    rounds.push({ a, b, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 8 }}>🚀</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: '2rem', fontWeight: 900 }}>
        <span style={{ color: '#1e293b' }}>{round.a}</span>
        <span style={{ color: '#f97316' }}>−</span>
        <span style={{ color: '#1e293b' }}>{round.b}</span>
        <span style={{ color: '#94a3b8' }}>=</span>
        <span style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#fff7ed', border: '3px solid #fb923c',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', color: '#ea580c',
        }}>?</span>
      </div>
    </div>
  )
}

export default function MinusRakete() {
  return (
    <MathGameEngine
      gameTitle="Minus-Rakete 🚀"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(r) => `${r.a} minus ${r.b} ist?`}
    />
  )
}
```

- [ ] **Step 10.2: Verify at `http://localhost:5173/app/mathe/minus-rakete`**

Rocket emoji + subtraction equation with `?` bubble. Four number options. Correct answer highlights green.

- [ ] **Step 10.3: Commit**

```bash
git add src/pages/app/games/mathe/MinusRakete.jsx
git commit -m "feat: add Minus-Rakete subtraction game"
```

---

## Task 11: Zahlenfolge

**Files:**
- Create: `src/pages/app/games/mathe/Zahlenfolge.jsx`

- [ ] **Step 11.1: Create the game file**

```jsx
// src/pages/app/games/mathe/Zahlenfolge.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { min: 0, max: 20,  rounds: 8, missionId: 'zahlenfolge-1', label: '+1 oder +2' },
  2: { min: 0, max: 50,  rounds: 8, missionId: 'zahlenfolge-2', label: '+2, +5, +10' },
  3: { min: 0, max: 100, rounds: 8, missionId: 'zahlenfolge-3', label: '+3, +5, +10' },
}

const STEPS_BY_LEVEL = {
  1: [1, 2],
  2: [2, 5, 10],
  3: [3, 5, 10],
}

function buildRounds(level, cfg) {
  const steps = STEPS_BY_LEVEL[level]
  const seqLen = 5
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const step  = steps[i % steps.length]
    const start = randInt(cfg.min, cfg.max - step * (seqLen - 1))
    const seq   = Array.from({ length: seqLen }, (_, k) => start + k * step)
    const gapIdx = randInt(1, seqLen - 2)
    const answer = seq[gapIdx]
    const sequence = seq.map((n, k) => (k === gapIdx ? null : n))
    const options  = generateOptions(answer, Math.max(0, answer - step * 2), answer + step * 2)
    rounds.push({ sequence, gapIdx, step, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
      {round.sequence.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{
            minWidth: 44, height: 44, borderRadius: 12,
            background: n === null ? '#8b5cf6' : '#ede9fe',
            color: n === null ? '#fff' : '#5b21b6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: n === null ? '1.3rem' : '1rem',
            border: n === null ? '3px solid #7c3aed' : '2px solid #ddd6fe',
            padding: '0 8px',
            boxShadow: n === null ? '0 2px 8px rgba(139,92,246,0.4)' : 'none',
          }}>
            {n === null ? '?' : n}
          </div>
          {i < round.sequence.length - 1 && (
            <span style={{ color: '#94a3b8', fontWeight: 900 }}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Zahlenfolge() {
  return (
    <MathGameEngine
      gameTitle="Zahlenfolge 🔗"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={() => 'Welche Zahl fehlt in der Folge?'}
    />
  )
}
```

- [ ] **Step 11.2: Verify at `http://localhost:5173/app/mathe/zahlenfolge`**

5-item sequence with `?` gap. Pattern is consistent (step visible from surrounding numbers). Options include distractors.

- [ ] **Step 11.3: Commit**

```bash
git add src/pages/app/games/mathe/Zahlenfolge.jsx
git commit -m "feat: add Zahlenfolge pattern game"
```

---

## Task 12: WuerfelRechnen

**Files:**
- Create: `src/pages/app/games/mathe/WuerfelRechnen.jsx`

- [ ] **Step 12.1: Create the game file**

```jsx
// src/pages/app/games/mathe/WuerfelRechnen.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { maxDie: 3, rounds: 8, missionId: 'wuerfelRechnen-1', label: 'Würfel 1–3' },
  2: { maxDie: 6, rounds: 8, missionId: 'wuerfelRechnen-2', label: 'Würfel 1–6' },
  3: { maxDie: 6, rounds: 8, missionId: 'wuerfelRechnen-3', label: 'Drei Würfel' },
}

// SVG dot positions for standard die faces 1–6
const DOT_POSITIONS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

function DiceFace({ value }) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1]
  return (
    <svg width="60" height="60" viewBox="0 0 100 100">
      <rect x="5" y="5" width="90" height="90" rx="18" fill="#fff" stroke="#e2e8f0" strokeWidth="4" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#1e293b" />
      ))}
    </svg>
  )
}

function buildRounds(level, cfg) {
  const rounds = []
  const dice = level === 3 ? 3 : 2
  for (let i = 0; i < cfg.rounds; i++) {
    const die1 = randInt(1, cfg.maxDie)
    const die2 = randInt(1, cfg.maxDie)
    const die3 = dice === 3 ? randInt(1, cfg.maxDie) : null
    const answer = die1 + die2 + (die3 ?? 0)
    const maxSum = dice * cfg.maxDie
    const options = generateOptions(answer, Math.max(dice, answer - 3), Math.min(maxSum, answer + 3))
    rounds.push({ die1, die2, die3, dice, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <DiceFace value={round.die1} />
      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>+</span>
      <DiceFace value={round.die2} />
      {round.die3 !== null && (
        <>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>+</span>
          <DiceFace value={round.die3} />
        </>
      )}
      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#94a3b8' }}>=</span>
      <span style={{
        width: 52, height: 52, borderRadius: '50%',
        background: '#f0fdf4', border: '3px solid #22c55e',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', fontWeight: 900, color: '#16a34a',
      }}>?</span>
    </div>
  )
}

export default function WuerfelRechnen() {
  return (
    <MathGameEngine
      gameTitle="Würfel-Rechnen 🎲"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(r) => `${r.die1} plus ${r.die2}${r.die3 ? ` plus ${r.die3}` : ''} ist?`}
    />
  )
}
```

- [ ] **Step 12.2: Verify at `http://localhost:5173/app/mathe/wuerfel-rechnen`**

Two SVG dice with dot patterns render. `+` signs and `?` result bubble. Level 3 shows 3 dice.

- [ ] **Step 12.3: Commit**

```bash
git add src/pages/app/games/mathe/WuerfelRechnen.jsx
git commit -m "feat: add Würfel-Rechnen dice game with SVG dot faces"
```

---

## Task 13: MiniMarkt

**Files:**
- Create: `src/pages/app/games/mathe/MiniMarkt.jsx`

- [ ] **Step 13.1: Create the game file**

```jsx
// src/pages/app/games/mathe/MiniMarkt.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, shuffle, generateOptions } from '../../../../lib/mathUtils.js'

// All prices in Cent to avoid float arithmetic errors
const ITEMS = [
  { name: '🍎 Apfel',        price: 50  },
  { name: '🍌 Banane',       price: 30  },
  { name: '🥛 Milch',        price: 120 },
  { name: '🍞 Brot',         price: 180 },
  { name: '🧃 Saft',         price: 90  },
  { name: '🧀 Käse',         price: 150 },
  { name: '🥚 Ei',           price: 20  },
  { name: '🍫 Schokolade',   price: 110 },
  { name: '🍊 Orange',       price: 40  },
  { name: '🥕 Karotte',      price: 35  },
]

// Format Cent as "1,20 €"
function formatCent(cent) {
  return (cent / 100).toFixed(2).replace('.', ',') + ' €'
}

const config = {
  1: { itemCount: 2, rounds: 8, missionId: 'miniMarkt-1', label: '2 Artikel' },
  2: { itemCount: 3, rounds: 8, missionId: 'miniMarkt-2', label: '3 Artikel' },
  3: { itemCount: 4, rounds: 8, missionId: 'miniMarkt-3', label: '4 Artikel' },
}

function buildRounds(level, cfg) {
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const items  = shuffle(ITEMS).slice(0, cfg.itemCount)
    const answer = items.reduce((sum, item) => sum + item.price, 0)
    const spread = 20
    const options = generateOptions(answer, Math.max(10, answer - spread * 2), answer + spread * 2)
    rounds.push({ items, options, answer })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ width: '100%' }}>
      {round.items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 4px',
          borderBottom: i < round.items.length - 1 ? '1px solid #e2e8f0' : 'none',
          fontSize: '0.95rem', fontWeight: 800,
        }}>
          <span>{item.name}</span>
          <span style={{ color: '#f59e0b', fontWeight: 900 }}>{formatCent(item.price)}</span>
        </div>
      ))}
      <div style={{
        marginTop: 10, paddingTop: 8, borderTop: '2px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between',
        fontSize: '1rem', fontWeight: 900, color: '#1e293b',
      }}>
        <span>Gesamt:</span>
        <span style={{ color: '#6366f1' }}>?</span>
      </div>
    </div>
  )
}

export default function MiniMarkt() {
  return (
    <MathGameEngine
      gameTitle="Mini-Markt 🛒"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(r) => `Was kostet alles zusammen?`}
      formatOption={formatCent}
    />
  )
}
```

- [ ] **Step 13.2: Verify at `http://localhost:5173/app/mathe/mini-markt`**

Shopping list with items and prices in "0,50 €" format. 4 option buttons show formatted € amounts. Correct total highlights green.

- [ ] **Step 13.3: Commit**

```bash
git add src/pages/app/games/mathe/MiniMarkt.jsx
git commit -m "feat: add Mini-Markt Euro price game"
```

---

## Task 14: EinmaleinsBlitz

**Files:**
- Create: `src/pages/app/games/mathe/EinmaleinsBlitz.jsx`

- [ ] **Step 14.1: Create the game file**

```jsx
// src/pages/app/games/mathe/EinmaleinsBlitz.jsx
import React from 'react'
import MathGameEngine from '../../../../components/game/MathGameEngine.jsx'
import { randInt, generateOptions } from '../../../../lib/mathUtils.js'

const config = {
  1: { tables: [2, 5, 10], rounds: 8, missionId: 'einmaleinsBlitz-1', label: '2er, 5er, 10er' },
  2: { tables: [2, 3, 4, 5], rounds: 8, missionId: 'einmaleinsBlitz-2', label: '2er bis 5er' },
  3: { tables: [6, 7, 8, 9], rounds: 8, missionId: 'einmaleinsBlitz-3', label: '6er bis 9er' },
}

function buildRounds(level, cfg) {
  const rounds = []
  for (let i = 0; i < cfg.rounds; i++) {
    const a = cfg.tables[i % cfg.tables.length]
    const b = randInt(1, 10)
    const answer = a * b
    const dotPattern = answer <= 50           // show dot grid for smaller products
    const options = generateOptions(answer, Math.max(1, answer - 10), answer + 10)
    rounds.push({ a, b, answer, dotPattern, options })
  }
  return rounds
}

function renderQuestion(round) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, fontSize: '2.2rem', fontWeight: 900, marginBottom: 12,
      }}>
        <span style={{ color: '#1e293b' }}>{round.a}</span>
        <span style={{ color: '#ef4444' }}>×</span>
        <span style={{ color: '#1e293b' }}>{round.b}</span>
        <span style={{ color: '#94a3b8' }}>=</span>
        <span style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#fef2f2', border: '3px solid #ef4444',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', color: '#dc2626',
        }}>?</span>
      </div>
      {round.dotPattern && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${round.b}, 1fr)`,
          gap: 4,
          justifyItems: 'center',
          maxWidth: 240,
          margin: '0 auto',
        }}>
          {Array.from({ length: round.a * round.b }, (_, i) => (
            <span key={i} style={{
              width: 18, height: 18, borderRadius: '50%',
              background: i < round.a ? '#ef4444' : '#fecaca',
              display: 'block',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function EinmaleinsBlitz() {
  return (
    <MathGameEngine
      gameTitle="Einmaleins-Blitz ✖️"
      config={config}
      buildRounds={buildRounds}
      renderQuestion={renderQuestion}
      speakQuestion={(r) => `${r.a} mal ${r.b} ist?`}
    />
  )
}
```

- [ ] **Step 14.2: Verify at `http://localhost:5173/app/mathe/einmaleins`**

Multiplication equation with `?` bubble. For small products (≤ 50), dot grid visualizes rows × columns. Level 1 uses 2, 5, 10 tables. Level 3 uses 6–9 tables.

- [ ] **Step 14.3: Commit**

```bash
git add src/pages/app/games/mathe/EinmaleinsBlitz.jsx
git commit -m "feat: add Einmaleins-Blitz multiplication game"
```

---

## Task 15: Final Integration & Push

- [ ] **Step 15.1: Verify all 7 games are reachable from the Mathe tab**

Navigate to `http://localhost:5173/app`, click **🔢 Mathe**. All 7 game cards should be visible across 3 level sections. Click each card — confirm it reaches the correct game page.

- [ ] **Step 15.2: Play through one full game on each game**

| Game | URL | Check |
|------|-----|-------|
| Zahlenstrahl | `/app/mathe/zahlenstrahl` | Number line gap fills, result screen shows stars |
| Mehr/Weniger | `/app/mathe/mehr-weniger` | Dot groups correct, >, <, = options work |
| Minus-Rakete | `/app/mathe/minus-rakete` | Equation displays, answer checks correctly |
| Zahlenfolge  | `/app/mathe/zahlenfolge` | Sequence with gap, step matches surrounding numbers |
| Würfel       | `/app/mathe/wuerfel-rechnen` | SVG dice show correct dot counts, sum is correct |
| Mini-Markt   | `/app/mathe/mini-markt` | Prices shown as "0,50 €", options formatted correctly |
| Einmaleins   | `/app/mathe/einmaleins` | Dot grid shows for small products, level 3 uses 6-9 tables |

- [ ] **Step 15.3: Verify XP is awarded after completing a game**

Complete a game → navigate to `/app` → confirm XP total increased and the game card in Mathe tab shows progress dots.

- [ ] **Step 15.4: Final commit and push**

```bash
git add -A
git commit -m "feat: 7 Mathe-Spiele + MathGameEngine + Dashboard Tabs

- MathGameEngine shared component (level select, 8 rounds, result)
- Dashboard Deutsch/Mathe tab switcher
- Zahlenstrahl, Mehr/Weniger, Minus-Rakete, Zahlenfolge,
  Würfel-Rechnen, Mini-Markt, Einmaleins-Blitz
- 21 new missions in gameData.js
- SVG dice faces, Euro formatting, dot-pattern multiplication

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin main
```
