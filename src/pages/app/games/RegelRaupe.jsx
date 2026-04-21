// src/pages/app/games/RegelRaupe.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import StarsRow from '../../../components/ui/StarsRow.jsx'
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
  const { hint, showHint, dismissHint, hintsUsedCount } = useHints(HINTS, difficulty, wrongCount)
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
    await completeSession({ missionId: 'regel-raupe-1', xpEarned, stars, correct: sentScore, total: TOTAL_SENTENCES, hintsUsed: hintsUsedCount })
    navigate('/app')
  }

  // ── Result screen ──
  if (phase === 'result') {
    return (
      <div className={gameStyles.resultPage}>
        <div className={gameStyles.resultEmoji}>
          <Icon emoji={sentScore === TOTAL_SENTENCES ? '🐛' : '⭐'} size={64} color={sentScore === TOTAL_SENTENCES ? '#10b981' : '#fbbf24'} />
        </div>
        <h1 className={gameStyles.resultTitle}>
          {sentScore === TOTAL_SENTENCES ? 'Regelmeister!' : 'Gut geübt!'}
        </h1>
        <p className={gameStyles.resultSub}>{sentScore}/{TOTAL_SENTENCES} Sätze fehlerlos</p>
        <div className={gameStyles.resultStats}>
          <Badge color="purple">+{sentScore * 15 + (sentScore === TOTAL_SENTENCES ? 5 : 0)} XP</Badge>
          <Badge color="yellow"><StarsRow count={sentScore === TOTAL_SENTENCES ? 3 : sentScore >= 2 ? 2 : 1} /></Badge>
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
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}><Icon emoji="←" size={14} /> Zurück</Button>
          <div className={gameStyles.gameInfo}>
            <span className={gameStyles.gameEmoji}><Icon emoji="🐛" size={24} color="#10b981" /></span>
            <h1 className={gameStyles.gameTitle}>RegelRaupe</h1>
          </div>
          <Badge color="gray">{sentIdx + 1}/{TOTAL_SENTENCES}</Badge>
        </div>

        <div className={styles.wordCard}>
          {allCorrect
            ? <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Icon emoji="🎉" size={24} /> Fehlerlos!</p>
            : <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626' }}>Fast — ein paar Fehler:</p>
          }
          <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
            {wordResults.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                <Icon emoji={r.correct ? '✓' : '❌'} size={16} color={r.correct ? '#16a34a' : '#dc2626'} />
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
