import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { EMOJI_BAUKASTEN_AUFGABEN } from '../../../lib/gameData.js'
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

export default function EmojiBaukasten() {
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [modus,    setModus]    = useState(null) // null | 'eltern' | 'kind'
  const [level,    setLevel]    = useState(null) // null | 1 | 2 | 3
  const [aufgaben, setAufgaben] = useState([])

  const [idx,      setIdx]      = useState(0)
  const [selected, setSelected] = useState(new Set()) // indices in palette
  const [checked,  setChecked]  = useState(false)
  const [score,    setScore]    = useState(0)
  const [phase,    setPhase]    = useState('playing')
  const [speaking, setSpeaking] = useState(false)

  const aufgabe = aufgaben[idx]
  const TOTAL   = aufgaben.length


  function startLevel(lvl) {
    const filtered = EMOJI_BAUKASTEN_AUFGABEN.filter(a => a.difficulty === lvl)
    const picked = shuffle(filtered).slice(0, 8).map(a => ({
      ...a,
      palette: shuffle([...a.richtige, ...a.falsche]),
    }))
    setAufgaben(picked)
    setLevel(lvl)
    setIdx(0)
    setSelected(new Set())
    setChecked(false)
    setScore(0)
    setPhase('playing')
  }

  // Kinder-Modus: automatisch vorlesen
  useEffect(() => {
    if (modus !== 'kind' || phase !== 'playing' || !aufgabe) return
    const t = setTimeout(() => speakQuestion(), 500)
    return () => clearTimeout(t)
  }, [modus, idx, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  function speakQuestion() {
    if (!aufgabe) return
    setSpeaking(true)
    speak(aufgabe.frage + ' Tippe auf die richtigen Bilder!')
    setTimeout(() => setSpeaking(false), 2000)
  }

  function toggleEmoji(i) {
    if (checked) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function handleCheck() {
    const selectedEmojis = [...selected].map(i => aufgabe.palette[i])
    const allCorrect = aufgabe.richtige.every(e => selectedEmojis.includes(e))
    const noWrong    = selectedEmojis.every(e => aufgabe.richtige.includes(e))
    const correct    = allCorrect && noWrong
    if (correct) { setScore(s => s + 1); playCorrect() } else { playWrong() }
    setChecked(true)
  }

  function handleNext() {
    if (idx + 1 >= TOTAL) setPhase('result')
    else {
      setIdx(i => i + 1)
      setSelected(new Set())
      setChecked(false)
    }
  }

  async function handleFinish() {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    playComplete()
    await completeSession({ missionId: `emoji-baukasten-${level}`, xpEarned: score * 2, stars, correct: score, total: TOTAL })
    navigate('/app')
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = score >= TOTAL ? 3 : score >= Math.ceil(TOTAL * 0.6) ? 2 : 1
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>{score >= TOTAL ? '🧩' : '⭐'}</div>
        <h1 className={styles.resultTitle}>{score >= TOTAL ? 'Baukasten-Profi!' : 'Gut gemacht!'}</h1>
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
            <span className={styles.gameEmoji}>🧩</span>
            <h1 className={styles.gameTitle}>Emoji-Baukasten</h1>
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
            <span className={styles.gameEmoji}>🧩</span>
            <h1 className={styles.gameTitle}>Emoji-Baukasten</h1>
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

  // Bestimme Ergebnis nach Check
  function emojiState(i) {
    const emoji = aufgabe.palette[i]
    const isRight = aufgabe.richtige.includes(emoji)
    const isSel   = selected.has(i)
    if (!checked) return isSel ? 'selected' : 'normal'
    if (isRight)  return 'correct'
    if (isSel)    return 'wrong'
    return 'normal'
  }

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🧩</span>
          <h1 className={styles.gameTitle}>Emoji-Baukasten</h1>
        </div>
        <Badge color="gray">{idx + 1}/{TOTAL}</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>

        {/* Frage-Emojis + Frage-Text */}
        <div className={styles.baukastenFrage}>
          <div className={styles.baukastenFrageEmojis}>
            {aufgabe.frageEmojis.map((e, i) => <span key={i}>{e}</span>)}
          </div>
          {isKind ? (
            <div className={styles.kindFrageBereich} style={{ marginTop: 8 }}>
              <button
                className={`${styles.speakBtn} ${speaking ? styles.speakBtnActive : ''}`}
                onClick={speakQuestion}
                style={{ fontSize: '2rem', padding: '10px 20px' }}
                aria-label="Frage vorlesen"
              >🔊</button>
              <div className={styles.kindFrageHint}>
                <span className={styles.kindPfeil}>👆</span>
                <span>Tippe zum Wiederholen!</span>
              </div>
            </div>
          ) : (
            <div className={styles.elternFrageBereich} style={{ justifyContent: 'center' }}>
              <p className={styles.baukastenFrageText}>{aufgabe.frage}</p>
              <button className={styles.elternSpeakBtn} onClick={() => speak(aufgabe.frage)} aria-label="Vorlesen">🔊</button>
            </div>
          )}
        </div>

        {/* Tipp-Hinweis */}
        {!checked && (
          <p className={styles.baukastenHint}>
            {isKind
              ? `Tippe auf ${aufgabe.richtige.length} richtige Bilder! 👇`
              : `Wähle ${aufgabe.richtige.length} passende Emojis aus:`
            }
          </p>
        )}

        {/* Emoji-Palette — Level 3 = 4 Spalten */}
        <div className={[
          styles.baukastenPalette,
          level === 3 ? styles.baukastenPalette3 : '',
        ].join(' ')}>
          {aufgabe.palette.map((emoji, i) => {
            const state = emojiState(i)
            return (
              <button
                key={i}
                className={[
                  styles.baukastenEmoji,
                  state === 'selected' ? styles.baukastenEmojiSelected : '',
                  state === 'correct'  ? styles.baukastenEmojiCorrect  : '',
                  state === 'wrong'    ? styles.baukastenEmojiWrong    : '',
                ].join(' ')}
                onClick={() => toggleEmoji(i)}
                disabled={checked}
              >
                {emoji}
              </button>
            )
          })}
        </div>

        {/* Fun-Fakt nach Check */}
        {checked && (
          <div className={`${styles.tierWissenFakt} ${styles.tierWissenFaktIn}`}>
            {aufgabe.fakt}
          </div>
        )}

        {/* Buttons */}
        <div className={styles.actions}>
          {!checked ? (
            <Button
              onClick={handleCheck}
              disabled={selected.size === 0}
              size="lg"
            >
              Fertig! ✓
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg">
              {idx + 1 >= TOTAL ? 'Ergebnis' : 'Weiter →'}
            </Button>
          )}
        </div>
      </Card>

      <div className={styles.progressDots}>
        {aufgaben.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < idx ? styles.dotDone : i === idx ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
