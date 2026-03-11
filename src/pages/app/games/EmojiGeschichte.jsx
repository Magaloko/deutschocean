import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { EMOJI_GESCHICHTEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'de-DE'
  utt.rate = 0.82
  utt.pitch = 1.1
  window.speechSynthesis.speak(utt)
}

export default function EmojiGeschichte() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [modus,    setModus]    = useState(null) // null | 'eltern' | 'kind'
  const [level,    setLevel]    = useState(null) // null | 1 | 2 | 3
  const [runden,   setRunden]   = useState([])

  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)
  const [phase,    setPhase]    = useState('playing')
  const [speaking, setSpeaking] = useState(false)

  const runde = runden[idx]
  const TOTAL = runden.length


  function startLevel(lvl) {
    const filtered = EMOJI_GESCHICHTEN.filter(r => r.difficulty === lvl)
    const picked = shuffle(filtered).slice(0, 8).map(r => ({
      ...r,
      options: shuffle([r.richtig, ...r.falsch]),
    }))
    setRunden(picked)
    setLevel(lvl)
    setIdx(0)
    setSelected(null)
    setScore(0)
    setPhase('playing')
  }

  // Kinder-Modus: automatisch vorlesen
  useEffect(() => {
    if (modus !== 'kind' || phase !== 'playing' || !runde) return
    const t = setTimeout(() => speakQuestion(), 500)
    return () => clearTimeout(t)
  }, [modus, idx, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function speakQuestion() {
    if (!runde) return
    setSpeaking(true)
    speak(runde.frage)
    setTimeout(() => setSpeaking(false), 1500)
  }

  function handleSelect(optIdx) {
    if (selected !== null) return
    setSelected(optIdx)
    const correct = runde.options[optIdx].text === runde.richtig.text
    if (correct) { setScore(s => s + 1); playCorrect() } else { playWrong() }
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) setPhase('result')
    else { setIdx(i => i + 1); setSelected(null) }
  }

  async function handleFinish() {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    playComplete()
    await completeSession({ missionId: `emoji-geschichte-${level}`, xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score >= TOTAL ? '📖' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score >= TOTAL ? 'Emoji-Profi!' : 'Gut gemacht!'}</h1>
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
            <span className={styles.gameEmoji}>📖</span>
            <h1 className={styles.gameTitle}>Emoji-Geschichten</h1>
          </div>
          <div />
        </div>
        <p className={styles.vehicleSelectTitle}>Wie möchtest du spielen? 🎮</p>
        <div className={styles.modusGrid}>
          <button className={`${styles.modusCard} ${styles.modusEltern}`} onClick={() => setModus('eltern')}>
            <span className={styles.modusEmoji}>👨‍👩‍👧</span>
            <strong className={styles.modusLabel}>Mit Eltern</strong>
            <span className={styles.modusDesc}>Ein Erwachsener liest die Fragen dem Kind vor</span>
          </button>
          <button className={`${styles.modusCard} ${styles.modusKind}`} onClick={() => setModus('kind')}>
            <span className={styles.modusEmoji}>👶</span>
            <strong className={styles.modusLabel}>Alleine</strong>
            <span className={styles.modusDesc}>Das Spiel spricht die Fragen automatisch laut vor 🔊</span>
          </button>
        </div>
      </div>
    )
  }

  // ── LEVEL-AUSWAHL ─────────────────────────────────────────────────────────
  if (!level) {
    return (
      <div className={`${styles.gamePage} fade-in`}>
        <div className={styles.gameHeader}>
          <Button variant="ghost" size="sm" onClick={() => setModus(null)}>← Zurück</Button>
          <div className={styles.gameInfo}>
            <span className={styles.gameEmoji}>📖</span>
            <h1 className={styles.gameTitle}>Emoji-Geschichten</h1>
          </div>
          <div />
        </div>
        <p className={styles.vehicleSelectTitle}>Wähle dein Level! 🌟</p>
        <div className={styles.levelGrid}>
          <button className={`${styles.levelCard} ${styles.levelCard1}`} onClick={() => startLevel(1)}>
            <span className={styles.levelStars}>⭐</span>
            <strong className={styles.levelTitle}>Level 1</strong>
            <span className={styles.levelLabel}>Leicht</span>
          </button>
          <button
            className={`${styles.levelCard} ${styles.levelCard2}`}
            onClick={() => startLevel(2)}
          >
            <span className={styles.levelStars}>⭐⭐</span>
            <strong className={styles.levelTitle}>Level 2</strong>
            <span className={styles.levelLabel}>Mittel</span>
          </button>
          <button
            className={`${styles.levelCard} ${styles.levelCard3}`}
            onClick={() => startLevel(3)}
          >
            <span className={styles.levelStars}>⭐⭐⭐</span>
            <strong className={styles.levelTitle}>Level 3</strong>
            <span className={styles.levelLabel}>Schwer</span>
          </button>
        </div>
      </div>
    )
  }

  // ── SPIELFELD ─────────────────────────────────────────────────────────────
  const isKind = modus === 'kind'
  const answered = selected !== null

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>📖</span>
          <h1 className={styles.gameTitle}>Emoji-Geschichten</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>

        {/* Emoji-Story-Sequenz */}
        <div className={styles.emojiStoryRow}>
          {runde.story.map((e, i) => (
            <span key={i} className={styles.emojiStoryChar}>{e}</span>
          ))}
        </div>

        {/* Frage (Eltern) oder Sprecher (Kind) */}
        {isKind ? (
          <div className={styles.kindFrageBereich}>
            <button
              className={`${styles.speakBtn} ${speaking ? styles.speakBtnActive : ''}`}
              onClick={speakQuestion}
              aria-label="Frage nochmal vorlesen"
            >🔊</button>
            <div className={styles.kindFrageHint}>
              <span className={styles.kindPfeil}>👆</span>
              <span>Tippe zum Wiederholen!</span>
            </div>
          </div>
        ) : (
          <div className={styles.elternFrageBereich}>
            <p className={styles.emojiStoryFrage}>{runde.frage}</p>
            <button
              className={styles.elternSpeakBtn}
              onClick={() => speak(runde.frage)}
              aria-label="Frage vorlesen"
            >🔊</button>
          </div>
        )}

        {/* Antwort-Optionen */}
        <div className={styles.emojiStoryAnswers}>
          {runde.options.map((opt, i) => {
            const isSelected = selected === i
            const isCorrect  = opt.text === runde.richtig.text
            let cls = styles.emojiStoryBtn
            if (answered && isCorrect)       cls += ` ${styles.choiceBtnCorrect}`
            else if (answered && isSelected) cls += ` ${styles.choiceBtnWrong}`

            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={answered}>
                <div className={styles.emojiStoryBtnEmojis}>
                  {opt.emojis.map((e, j) => <span key={j}>{e}</span>)}
                </div>
                {!isKind && <div className={styles.emojiStoryBtnText}>{opt.text}</div>}
              </button>
            )
          })}
        </div>

        {/* Fun-Fakt nach Antwort */}
        {answered && (
          <div className={`${styles.tierWissenFakt} ${styles.tierWissenFaktIn}`}>
            {runde.fakt}
          </div>
        )}

        {answered && (
          <div className={styles.actions}>
            <Button onClick={handleNext} size="lg">
              {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
            </Button>
          </div>
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
