import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import StarsRow from '../../../components/ui/StarsRow.jsx'
import { WAS_FEHLT_RUNDEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete, speak } from '../../../lib/sounds.js'
import styles from './Game.module.css'
import { useAdaptivity } from '../../../hooks/useAdaptivity.js'
import { useHints } from '../../../hooks/useHints.js'
import { useOzzy } from '../../../hooks/useOzzy.js'
import OzzyMascot from '../../../components/game/OzzyMascot.jsx'
import { shouldOfferHint } from '../../../lib/adaptivityEngine.js'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5
const SHOW_MS = 3000

const HINTS = {
  long:   { text: 'Merke dir alle Gegenstände genau — schau dir Farbe, Form und Position an! Dann verschwindet einer...', tts: true },
  medium: { text: 'Konzentriere dich auf jeden Gegenstand einzeln, dann überprüfe sie alle.', tts: false },
  short:  { text: '💡 Was war da — was fehlt jetzt?', tts: false },
}

export default function WasFehlt() {
  const navigate = useNavigate()
  const { completeSession, saving, weakGames } = useProgress()

  const initialDifficulty = (weakGames['was-fehlt-1'] ?? 0) > 0 ? 'easy' : 'normal'
  const { difficulty, wrongCount, recordAnswer } = useAdaptivity(initialDifficulty)
  const { hint, showHint, dismissHint }          = useHints(HINTS, difficulty, wrongCount)
  const { mood, message, react: ozzReact }       = useOzzy()
  const prevDiffRef = useRef(initialDifficulty)

  const [runden] = useState(() =>
    shuffle(WAS_FEHLT_RUNDEN).slice(0, TOTAL).map((r) => {
      const missingIdx = Math.floor(Math.random() * r.emoji.length)
      const allItems   = r.emoji.map((e, i) => ({ emoji: e, label: r.labels[i] }))
      const missing    = allItems[missingIdx]
      const visible    = allItems.filter((_, i) => i !== missingIdx)
      const distractors = shuffle(allItems.filter((_, i) => i !== missingIdx)).slice(0, 2)
      const choices    = shuffle([
        { ...missing, correct: true },
        ...distractors.map((d) => ({ ...d, correct: false })),
      ])
      return { allItems, visible, missing, choices }
    })
  )

  const [idx, setIdx]         = useState(0)
  const [phase, setPhase]     = useState('memorize') // 'memorize' | 'guess'
  const [selected, setSelected] = useState(null)
  const [score, setScore]     = useState(0)
  const [gamePhase, setGamePhase] = useState('playing') // 'playing' | 'result'

  const runde = runden[idx]

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  useEffect(() => {
    if (phase === 'memorize') speak('Merke dir alle Bilder!')
    else speak('Was fehlt?')
  }, [phase, idx])

  useEffect(() => {
    if (phase !== 'memorize') return
    const t = setTimeout(() => setPhase('guess'), SHOW_MS)
    return () => clearTimeout(t)
  }, [phase, idx])

  function handleChoice(choice) {
    if (selected) return
    setSelected(choice)
    const correct = choice.correct
    recordAnswer(correct)
    dismissHint()
    if (correct) {
      setScore((s) => s + 1)
      playCorrect()
      ozzReact('correct')
    } else {
      playWrong()
      ozzReact('wrong')
    }
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setGamePhase('result')
    } else {
      setIdx((i) => i + 1)
      setPhase('memorize')
      setSelected(null)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    playComplete()
    ozzReact('celebrate')
    await completeSession({ missionId: 'was-fehlt-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  if (gamePhase === 'result') {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>
          <Icon emoji={score === TOTAL ? '🔍' : '⭐'} size={64} color={score === TOTAL ? '#6366f1' : '#fbbf24'} />
        </div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Super Detektiv!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 2} XP</Badge>
          <Badge color="yellow"><StarsRow count={stars} /></Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Zurück</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}><Icon emoji="←" size={14} /> Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}><Icon emoji="🔍" size={24} color="#6366f1" /></span>
          <h1 className={styles.gameTitle}>Was fehlt?</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <Card padding="lg" className={styles.gameCard}>
        {hint ? (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint.text}</p>
            <button className={styles.hintDismiss} onClick={dismissHint} aria-label="Tipp schließen">✕</button>
          </div>
        ) : (!selected && phase === 'guess' && shouldOfferHint(difficulty, wrongCount)) && (
          <button className={styles.hintBtn} onClick={showHint}>💡 Tipp anzeigen</button>
        )}

        {phase === 'memorize' ? (
          <>
            <div className={styles.targetDisplay}>
              <span>Merke dir alle Bilder! 👀</span>
            </div>
            <div className={styles.timerBar}>
              <div key={idx} className={`${styles.timerFill} ${styles.timerShrink}`} />
            </div>
            <div className={styles.kidsGrid}>
              {runde.allItems.map((item, i) => (
                <div key={i} className={styles.kidsEmojiBig}>{item.emoji}</div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.targetDisplay}>
              <span>Was fehlt? 🤔</span>
              <button className={styles.elternSpeakBtn} onClick={() => speak('Was fehlt?')} aria-label="Vorlesen">🔊</button>
            </div>
            <div className={styles.kidsGrid}>
              {runde.visible.map((item, i) => (
                <div key={i} className={styles.kidsEmojiBig}>{item.emoji}</div>
              ))}
              <div className={`${styles.kidsEmojiBig} ${styles.emojiMissing}`}>❓</div>
            </div>

            <div className={styles.choiceRow}>
              {runde.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(c)}
                  disabled={!!selected}
                  className={[
                    styles.emojiChoiceBtn,
                    selected
                      ? c.correct
                        ? styles.choiceCorrect
                        : selected === c
                          ? styles.choiceWrong
                          : ''
                      : '',
                  ].join(' ')}
                >
                  <span className={styles.choiceEmoji}>{c.emoji}</span>
                  <span className={styles.choiceLabel}>{c.label}</span>
                </button>
              ))}
            </div>

            {selected && (
              <>
                <div className={`${styles.resultBanner} ${selected.correct ? styles.resultGreen : styles.resultRed}`}>
                  {selected.correct
                    ? `✓ Richtig! ${runde.missing.emoji} ${runde.missing.label} hat gefehlt!`
                    : `✗ ${runde.missing.emoji} ${runde.missing.label} hat gefehlt!`}
                </div>
                <div className={styles.actions}>
                  <Button onClick={handleNext} size="lg">
                    {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </Card>

      <div className={styles.progressDots}>
        {runden.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
