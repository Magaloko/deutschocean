// src/pages/app/games/WortFamilien.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import Icon from '../../../components/ui/Icon.jsx'
import StarsRow from '../../../components/ui/StarsRow.jsx'
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
    text: 'Wörter einer Familie haben dieselbe Wurzel — denselben Kernteil. "fahren", "Fahrer", "Fahrt" gehören alle zur Wurzel "fahr-". Hörst du den Klang?',
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

  const [sets]                          = useState(() => shuffle(getSetPool(initialDifficulty)).slice(0, TOTAL_ROUNDS))
  const [roundIdx, setRoundIdx]         = useState(0)
  const [selectedWord, setSelectedWord] = useState(null)
  const [assignments, setAssignments]   = useState({})
  const [checked, setChecked]           = useState(false)
  const [score, setScore]               = useState(0)
  const [phase, setPhase]               = useState('playing')

  useEffect(() => {
    if (difficulty !== prevDiffRef.current) {
      if (difficulty === 'hard') ozzReact('levelUp')
      else if (difficulty === 'easy') ozzReact('levelDown')
      prevDiffRef.current = difficulty
    }
  }, [difficulty, ozzReact])

  const currentSet = sets[roundIdx]
  if (!currentSet) return null

  const allWords = shuffle(currentSet.families.flatMap((f) => f.words))

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
    let correct = 0
    for (const [word, fid] of Object.entries(assignments)) {
      if (correctMap[word] === fid) correct++
    }
    const allCorrect = correct === allWords.length
    if (allCorrect) { playCorrect(); ozzReact('correct'); setScore((s) => s + 1) }
    else            { playWrong();   ozzReact('wrong') }
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

  if (phase === 'result') {
    return (
      <div className={gameStyles.resultPage}>
        <div className={gameStyles.resultEmoji}>
          <Icon emoji={score === TOTAL_ROUNDS ? '🌳' : '⭐'} size={64} color={score === TOTAL_ROUNDS ? '#10b981' : '#fbbf24'} />
        </div>
        <h1 className={gameStyles.resultTitle}>
          {score === TOTAL_ROUNDS ? 'Wortforscher!' : 'Gut gemacht!'}
        </h1>
        <p className={gameStyles.resultSub}>{score}/{TOTAL_ROUNDS} Runden perfekt</p>
        <div className={gameStyles.resultStats}>
          <Badge color="purple">+{score * 10 + (score === TOTAL_ROUNDS ? 15 : 0)} XP</Badge>
          <Badge color="yellow"><StarsRow count={score === TOTAL_ROUNDS ? 3 : score >= 2 ? 2 : 1} /></Badge>
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}><Icon emoji="←" size={14} /> Zurück</Button>
        <div className={gameStyles.gameInfo}>
          <span className={gameStyles.gameEmoji}><Icon emoji="🌳" size={24} color="#10b981" /></span>
          <h1 className={gameStyles.gameTitle}>WortFamilien</h1>
        </div>
        <Badge color="gray">{roundIdx + 1}/{TOTAL_ROUNDS}</Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.5rem' }}>
        <OzzyMascot mood={mood} message={message} />
      </div>

      <p className={styles.instruction}>
        {selectedWord
          ? <>Tippe eine Familie für <strong>„{selectedWord}“</strong>:</>
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
