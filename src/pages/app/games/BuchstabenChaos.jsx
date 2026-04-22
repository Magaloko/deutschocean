// src/pages/app/games/BuchstabenChaos.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Input from '../../../components/ui/Input.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import StarsRow from '../../../components/ui/StarsRow.jsx'
import StrategyPicker from '../../../components/game/StrategyPicker.jsx'
import Debriefing from '../../../components/game/Debriefing.jsx'
import { useStrategy } from '../../../hooks/useStrategy.js'
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
  medium: { text: 'Fang mit dem ersten Buchstaben an und baue das Wort auf.', tts: false },
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
  const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()
  const { strategy, pickStrategy }               = useStrategy()

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
    const xpEarned = Math.round(score * 2 * (strategy?.xpMultiplier ?? 1))
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'buchstaben-chaos-1', xpEarned, stars, correct: score, total: TOTAL, hintsUsed: hintsUsedCount })
    navigate('/app')
  }

  if (!strategy) {
    return (
      <div className={`${styles.gamePage} fade-in`}>
        <div className={styles.gameHeader}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}><Icon emoji="←" size={14} /> Zurück</Button>
          <div className={styles.gameInfo}>
            <span className={styles.gameEmoji}><Icon emoji="🔤" size={24} color="#f97316" /></span>
            <h1 className={styles.gameTitle}>Buchstaben-Chaos</h1>
          </div>
          <div />
        </div>
        <StrategyPicker gameTitle="Buchstaben-Chaos" onSelect={pickStrategy} />
      </div>
    )
  }

  if (phase === 'result') {
    const stars = score === TOTAL ? 3 : score >= TOTAL * 0.6 ? 2 : 1
    const xpEarned = Math.round(score * 2 * (strategy?.xpMultiplier ?? 1))
    const highlights = []
    if (score === TOTAL) highlights.push('Perfekt! Alle Wörter sortiert.')
    else highlights.push(`${score} von ${TOTAL} Wörtern gelöst.`)
    if (hintsUsedCount > 0) highlights.push(`${hintsUsedCount}× Tipps genutzt.`)
    return (
      <Debriefing
        gameTitle="Buchstaben-Chaos"
        icon={score === TOTAL ? '🔤' : '⭐'}
        color="#f97316"
        stars={stars}
        xpEarned={xpEarned}
        score={score}
        total={TOTAL}
        hintsUsed={hintsUsedCount}
        strategy={strategy}
        highlights={highlights}
        nextTip={score < TOTAL ? 'Sprich das Wort laut aus — hören hilft beim Buchstaben-Sortieren.' : 'Hast du es schon mit Express-Modus versucht?'}
        onContinue={handleFinish}
        saving={saving}
      />
    )
  }

  const isCorrect = checked && answer.toUpperCase().trim() === item.word

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}><Icon emoji="←" size={14} /> Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}><Icon emoji="🔤" size={24} color="#f97316" /></span>
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
