import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { EMOTIONEN_RUNDEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const TOTAL = 5

function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'de-DE'
  utt.rate = 0.82
  utt.pitch = 1.1
  window.speechSynthesis.speak(utt)
}

export default function EmotionenSpiel() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [modus, setModus] = useState(null) // null | 'eltern' | 'kind'

  const [runden] = useState(() =>
    shuffle(EMOTIONEN_RUNDEN).slice(0, TOTAL).map((r) => ({
      question: r.question,
      targetEmotion: r.targetEmotion,
      shuffledFaces: shuffle(r.faces),
    }))
  )

  const [idx,       setIdx]       = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [score,     setScore]     = useState(0)
  const [gamePhase, setGamePhase] = useState('playing')
  const [speaking,  setSpeaking]  = useState(false)

  const runde = runden[idx]

  // Kinder-Modus: automatisch vorlesen wenn Runde startet
  useEffect(() => {
    if (modus !== 'kind' || gamePhase !== 'playing' || !runde) return
    const t = setTimeout(() => {
      speakQuestion()
    }, 500)
    return () => clearTimeout(t)
  }, [modus, idx, gamePhase]) // eslint-disable-line react-hooks/exhaustive-deps

  function speakQuestion() {
    if (!runde) return
    setSpeaking(true)
    speak(`Welches Gesicht ist ${runde.targetEmotion}?`)
    // kurzes visuelles Feedback
    setTimeout(() => setSpeaking(false), 1500)
  }

  function handleSelect(face) {
    if (selected) return
    setSelected(face)
    if (face.isTarget) {
      setScore((s) => s + 1)
      playCorrect()
      if (modus === 'kind') setTimeout(() => speak('Richtig! Super gemacht!'), 300)
    } else {
      playWrong()
      const target = runde.shuffledFaces.find(f => f.isTarget)
      if (modus === 'kind') setTimeout(() => speak(`Das ist ${target.label}!`), 300)
    }
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) {
      setGamePhase('result')
    } else {
      setIdx((i) => i + 1)
      setSelected(null)
    }
  }

  async function handleFinish() {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    playComplete()
    await completeSession({ missionId: 'emotionen-1', xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (gamePhase === 'result') {
    const stars = score === TOTAL ? 3 : score >= 3 ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score === TOTAL ? '😊' : '🌟'}</div>
        <h1 className={styles.resultTitle}>{score === TOTAL ? 'Gefühls-Profi!' : 'Gut gemacht!'}</h1>
        <p className={styles.resultSub}>{score}/{TOTAL} richtig</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{score * 2} XP</Badge>
          <Badge color="yellow">{'⭐'.repeat(stars)}</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Zurück</Button>
        </div>
      </div>
    )
  }

  // ── MODUS-AUSWAHL ─────────────────────────────────────────────────────────
  if (!modus) {
    return (
      <div className={`${styles.gamePage} fade-in`}>
        <div className={styles.gameHeader}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
          <div className={styles.gameInfo}>
            <span className={styles.gameEmoji}>😊</span>
            <h1 className={styles.gameTitle}>Gefühle</h1>
          </div>
          <div />
        </div>

        <p className={styles.vehicleSelectTitle}>Wie möchtest du spielen? 🎮</p>

        <div className={styles.modusGrid}>
          <button
            className={`${styles.modusCard} ${styles.modusEltern}`}
            onClick={() => setModus('eltern')}
          >
            <span className={styles.modusEmoji}>👨‍👩‍👧</span>
            <strong className={styles.modusLabel}>Mit Eltern</strong>
            <span className={styles.modusDesc}>
              Ein Erwachsener liest die Fragen dem Kind vor
            </span>
          </button>

          <button
            className={`${styles.modusCard} ${styles.modusKind}`}
            onClick={() => setModus('kind')}
          >
            <span className={styles.modusEmoji}>👶</span>
            <strong className={styles.modusLabel}>Alleine</strong>
            <span className={styles.modusDesc}>
              Das Spiel spricht die Fragen automatisch laut vor 🔊
            </span>
          </button>
        </div>
      </div>
    )
  }

  // ── SPIELFELD ─────────────────────────────────────────────────────────────
  const isKind     = modus === 'kind'
  const targetFace = runde.shuffledFaces.find((f) => f.isTarget)

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>😊</span>
          <h1 className={styles.gameTitle}>Gefühle</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>

        {isKind ? (
          /* ── Kinder-Modus: Sprecher-Knopf ── */
          <div className={styles.kindFrageBereich}>
            <button
              className={`${styles.speakBtn} ${speaking ? styles.speakBtnActive : ''}`}
              onClick={speakQuestion}
              aria-label="Frage nochmal vorlesen"
            >
              🔊
            </button>
            <div className={styles.kindFrageHint}>
              <span className={styles.kindPfeil}>👆</span>
              <span>Tippe zum Wiederholen!</span>
            </div>
          </div>
        ) : (
          /* ── Eltern-Modus: Textfrage + optionaler Vorlesen-Button ── */
          <div className={styles.elternFrageBereich}>
            <div className={styles.emotionQuestion}>{runde.question}</div>
            <button
              className={styles.elternSpeakBtn}
              onClick={() => speak(runde.question)}
              title="Vorlesen"
              aria-label="Frage vorlesen"
            >
              🔊
            </button>
          </div>
        )}

        {/* Gesichter-Grid */}
        <div className={`${styles.emotionGrid} ${isKind ? styles.emotionGridKind : ''}`}>
          {runde.shuffledFaces.map((face, i) => (
            <button
              key={i}
              onClick={() => handleSelect(face)}
              disabled={!!selected}
              className={[
                styles.emotionBtn,
                isKind ? styles.emotionBtnKind : '',
                selected
                  ? face.isTarget
                    ? styles.btnCorrect
                    : selected === face
                      ? styles.btnWrong
                      : ''
                  : '',
              ].join(' ')}
            >
              <span className={`${styles.emotionEmoji} ${isKind ? styles.emotionEmojiKind : ''}`}>
                {face.emoji}
              </span>
              {!isKind && <span className={styles.emotionLabel}>{face.label}</span>}
            </button>
          ))}
        </div>

        {/* Feedback nach Antwort */}
        {selected && (
          <>
            <div className={`${styles.resultBanner} ${selected.isTarget ? styles.resultGreen : styles.resultRed}`}>
              {selected.isTarget
                ? isKind
                  ? `✓ Super! ${targetFace.emoji}`
                  : `✓ Richtig! ${targetFace.emoji} ist ${runde.targetEmotion}!`
                : isKind
                  ? `${targetFace.emoji} ist ${runde.targetEmotion}`
                  : `✗ ${targetFace.emoji} (${targetFace.label}) ist ${runde.targetEmotion}!`
              }
            </div>
            <div className={styles.actions}>
              <Button onClick={handleNext} size="lg">
                {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
              </Button>
            </div>
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
