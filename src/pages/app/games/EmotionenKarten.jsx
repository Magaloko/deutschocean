import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { KARTEN_KATEGORIEN } from '../../../lib/emotionenKartenData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCorrect, playWrong, playComplete, speak } from '../../../lib/sounds.js'
import PixelCharacter from '../../../components/ui/PixelCharacter.jsx'
import styles from './EmotionenKarten.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function calcStars(score, total) {
  const pct = score / total
  if (pct >= 0.9) return 3
  if (pct >= 0.6) return 2
  return 1
}

export default function EmotionenKarten() {
  const navigate = useNavigate()
  const { completeSession, saving, completedMissions } = useProgress()

  // ── Phase ─────────────────────────────────────────────────────────────────
  const [kat,       setKat]       = useState(null)   // KARTEN_KATEGORIEN[i]
  const [karten,    setKarten]    = useState([])
  const [idx,       setIdx]       = useState(0)
  const [phase,     setPhase]     = useState('playing') // 'playing' | 'result'

  // ── Antwort-State ─────────────────────────────────────────────────────────
  const [selected,    setSelected]    = useState(null)       // Kat 1,2 single
  const [selectedSet, setSelectedSet] = useState(new Set())  // Kat 3,4,5 multi
  const [confirmed,   setConfirmed]   = useState(false)
  const [score,       setScore]       = useState(0)

  const karte = karten[idx]
  const TOTAL = karten.length

  // ── Unlock: Kat N freigeschaltet wenn Kat N-1 abgeschlossen ───────────────
  function isUnlocked(katId) {
    if (katId === 1) return true
    const prevMission = KARTEN_KATEGORIEN[katId - 2].missionId
    return completedMissions.includes(prevMission)
  }

  // ── Spiel starten ─────────────────────────────────────────────────────────
  function startKat(k) {
    if (!isUnlocked(k.id)) return
    const picked = shuffle(k.fragen).slice(0, Math.min(8, k.fragen.length))
    setKat(k)
    setKarten(picked)
    setIdx(0)
    setScore(0)
    setPhase('playing')
    setSelected(null)
    setSelectedSet(new Set())
    setConfirmed(false)
  }

  // ── Auto-speak bei neuer Karte ─────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing' && karte) {
      speak(karte.frage)
    }
  }, [idx, phase, karte])

  // ── Kat 1+2: Single-Select ─────────────────────────────────────────────────
  function handleSingleSelect(option) {
    if (confirmed) return
    setSelected(option)
    const isCorrect = option === karte.richtig
    if (isCorrect) { playCorrect(); setScore(s => s + 1) }
    else             playWrong()
    setConfirmed(true)
  }

  // ── Kat 3: Situation-Auswahl (eine richtige) ──────────────────────────────
  function handleSituationSelect(idx_opt) {
    if (confirmed) return
    const opt = karte.optionen[idx_opt]
    const ns = new Set([idx_opt])
    setSelectedSet(ns)
    if (opt.richtig) { playCorrect(); setScore(s => s + 1) }
    else               playWrong()
    setConfirmed(true)
  }

  // ── Kat 4+5: Multi-Select toggle ──────────────────────────────────────────
  function handleMultiToggle(key) {
    if (confirmed) return
    setSelectedSet(prev => {
      const ns = new Set(prev)
      if (ns.has(key)) ns.delete(key)
      else              ns.add(key)
      return ns
    })
  }

  // ── Kat 4+5: Bestätigen ────────────────────────────────────────────────────
  function handleConfirm() {
    if (confirmed || selectedSet.size === 0) return
    // Prüfe ob die Auswahl korrekt ist
    let isCorrect
    if (karte.type === 'emotion-entscheidung') {
      const richtigSet = new Set(karte.richtig)
      isCorrect = selectedSet.size === richtigSet.size &&
        [...selectedSet].every(s => richtigSet.has(s))
    } else {
      // empathie-reaktion — Index-basiert
      const richtigIndices = karte.optionen
        .map((o, i) => o.richtig ? i : null)
        .filter(i => i !== null)
      const richtigSet = new Set(richtigIndices)
      isCorrect = selectedSet.size === richtigSet.size &&
        [...selectedSet].every(s => richtigSet.has(s))
    }
    if (isCorrect) { playCorrect(); setScore(s => s + 1) }
    else             playWrong()
    setConfirmed(true)
  }

  // ── Weiter ─────────────────────────────────────────────────────────────────
  function handleWeiter() {
    if (idx + 1 >= TOTAL) {
      // Spiel beendet
      playComplete()
      setPhase('result')
      const stars = calcStars(score + (confirmed && isLastCorrect() ? 0 : 0), TOTAL)
      completeSession({ missionId: kat.missionId, xpEarned: 20, stars })
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setSelectedSet(new Set())
      setConfirmed(false)
    }
  }

  function isLastCorrect() {
    // helper — not needed for score since we track in handleConfirm/handleSingle
    return false
  }

  // ── Feedback-Text ─────────────────────────────────────────────────────────
  function getFeedback() {
    if (!confirmed) return null
    const type = karte.type

    if (type === 'situation-emoji-check' || type === 'situation-erraten') {
      const correct = selected === karte.richtig
      return {
        ok: correct,
        text: correct
          ? `Genau! Das Kind fühlt sich ${karte.richtig}.`
          : `Das Kind fühlt sich ${karte.richtig}!`,
      }
    }
    if (type === 'emoji-zu-situation') {
      const opt = karte.optionen[[...selectedSet][0]]
      const correct = opt?.richtig
      return {
        ok: correct,
        text: correct ? 'Richtig! Das passt zur Situation.' : `Falsch! "${karte.optionen.find(o => o.richtig)?.text}" wäre richtig.`,
      }
    }
    if (type === 'emotion-entscheidung' || type === 'empathie-reaktion') {
      const richtig = karte.richtig
      const richtigIndices = karte.optionen?.map((o, i) => o.richtig ? i : null).filter(i => i !== null)
      let correct
      if (type === 'emotion-entscheidung') {
        const rs = new Set(richtig)
        correct = selectedSet.size === rs.size && [...selectedSet].every(s => rs.has(s))
      } else {
        const rs = new Set(richtigIndices)
        correct = selectedSet.size === rs.size && [...selectedSet].every(s => rs.has(s))
      }
      return {
        ok: correct,
        text: karte.erklaerung || (correct ? 'Super!' : 'Fast! Schau dir die richtigen Antworten an.'),
      }
    }
    return null
  }

  // ── Result-Screen ──────────────────────────────────────────────────────────
  if (phase === 'result' && kat) {
    const stars = calcStars(score, TOTAL)
    return (
      <div className={styles.page}>
        <div className={styles.result}>
          <div className={styles.resultEmoji}>{stars === 3 ? '🏆' : stars === 2 ? '🌟' : '⭐'}</div>
          <h2 className={styles.resultTitle}>{stars === 3 ? 'Perfekt!' : stars === 2 ? 'Super!' : 'Gut gemacht!'}</h2>
          <p className={styles.resultScore}>{score} von {TOTAL} richtig</p>
          <div className={styles.resultStars}>{'⭐'.repeat(stars)}</div>
          <div className={styles.resultActions}>
            <button
              className={styles.weiterBtn}
              style={{ background: kat.color }}
              onClick={() => { setKat(null); setPhase('playing') }}
            >
              Zurück zur Auswahl
            </button>
            <button
              className={styles.weiterBtn}
              style={{ background: '#64748b' }}
              onClick={() => navigate('/app')}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Kategorie-Auswahl ──────────────────────────────────────────────────────
  if (!kat) {
    return (
      <div className={styles.page}>
        <div className={styles.kategorieHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/app')}>←</button>
          <h1 className={styles.kategorieTitle}>Emotions-Karten 🎭</h1>
          <p className={styles.kategorieSub}>Lerne Gefühle verstehen und erkennen</p>
        </div>
        <div className={styles.kategorieGrid}>
          {KARTEN_KATEGORIEN.map((k) => {
            const locked = !isUnlocked(k.id)
            return (
              <button
                key={k.id}
                className={`${styles.kategorieCard} ${locked ? styles.katLocked : ''}`}
                style={{
                  background: k.bg,
                  borderColor: locked ? '#e2e8f0' : k.border,
                  color: k.color,
                }}
                onClick={() => startKat(k)}
              >
                <span className={styles.katIcon}>{locked ? '🔒' : k.icon}</span>
                <span className={styles.katTitle}>{k.title}</span>
                <span className={styles.katDesc}>{locked ? `Kat ${k.id - 1} zuerst!` : k.desc}</span>
                {locked && <span className={styles.katLockBadge}>🔒</span>}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Spielfeld ──────────────────────────────────────────────────────────────
  if (!karte) return null
  const feedback = getFeedback()
  const type = karte.type

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <button className={styles.backBtn} onClick={() => setKat(null)}>←</button>
        <span
          className={styles.katBadge}
          style={{ background: kat.bg, color: kat.color }}
        >
          {kat.icon} {kat.title}
        </span>
        <button className={styles.speakHeaderBtn} onClick={() => speak(karte.frage)}>🔊</button>
      </div>

      {/* Fortschritt */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(idx / TOTAL) * 100}%` }} />
        </div>
        <div className={styles.progressLabel}>{idx + 1} / {TOTAL}</div>
      </div>

      <div className={styles.karte}>
        {/* Szene */}
        <div className={styles.sceneBox} style={{ background: kat.bg }}>
          {/* Falsches Emoji (Kat 1) */}
          {type === 'situation-emoji-check' && (
            <div className={styles.wrongEmojiBox}>
              <span>{karte.wrongEmoji}</span>
              <span>Stimmt das?</span>
            </div>
          )}

          {/* Emoji (Kat 3) */}
          {type === 'emoji-zu-situation' && (
            <div className={styles.sceneEmojis} style={{ fontSize: '4rem' }}>
              {karte.emoji}
            </div>
          )}

          {/* Szenen-Emojis (Kat 1, 2, 4, 5) */}
          {(type !== 'emoji-zu-situation') && karte.sceneEmojis && (
            <div className={styles.sceneEmojis}>
              {karte.sceneEmojis.map((e, i) => <span key={i}>{e}</span>)}
            </div>
          )}

          {karte.sceneBeschreibung && (
            <p className={styles.sceneDesc}>{karte.sceneBeschreibung}</p>
          )}

          {/* Charakter */}
          <PixelCharacter
            emotion={confirmed ? karte.charEmotion : (type === 'emoji-zu-situation' ? karte.charEmotion : 'confused')}
            variant={karte.charVariant}
            size={90}
            animated={confirmed}
          />
        </div>

        {/* Frage */}
        <p className={styles.frageText}>{karte.frage}</p>

        {/* ── Antwort-Bereich je Typ ── */}

        {/* Kat 1 + 2: 2×2 Grid */}
        {(type === 'situation-emoji-check' || type === 'situation-erraten') && (
          <div className={styles.antwortGrid}>
            {karte.optionen.map((opt) => {
              let cls = styles.antwortBtn
              if (confirmed) {
                if (opt === karte.richtig)  cls += ' ' + styles.antwortKorrekt
                else if (opt === selected)  cls += ' ' + styles.antwortFalsch
              } else if (opt === selected) {
                cls += ' ' + styles.antwortSelected
              }
              return (
                <button key={opt} className={cls} onClick={() => handleSingleSelect(opt)} disabled={confirmed}>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Kat 3: Situation-Liste */}
        {type === 'emoji-zu-situation' && (
          <div className={styles.situationGrid}>
            {karte.optionen.map((opt, i) => {
              let cls = styles.situationBtn
              if (confirmed) {
                if (opt.richtig)              cls += ' ' + styles.antwortKorrekt
                else if (selectedSet.has(i))  cls += ' ' + styles.antwortFalsch
              } else if (selectedSet.has(i)) {
                cls += ' ' + styles.antwortSelected
              }
              return (
                <button key={i} className={cls} onClick={() => handleSituationSelect(i)} disabled={confirmed}>
                  <span className={styles.situationEmojis}>{opt.emojis.join('')}</span>
                  <span>{opt.text}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Kat 4: Multi-Select Emotion */}
        {type === 'emotion-entscheidung' && (
          <>
            <div className={styles.multiGrid}>
              {karte.optionen.map((opt) => {
                const isSelected = selectedSet.has(opt)
                let cls = styles.multiBtn
                if (confirmed) {
                  if (karte.richtig.includes(opt)) cls += ' ' + styles.multiBtnKorrekt
                  else if (isSelected)              cls += ' ' + styles.multiBtnFalsch
                } else if (isSelected) {
                  cls += ' ' + styles.multiBtnSelected
                }
                return (
                  <button key={opt} className={cls} onClick={() => handleMultiToggle(opt)} disabled={confirmed}>
                    {opt}
                  </button>
                )
              })}
            </div>
            {!confirmed && (
              <button
                className={styles.bestaetigenBtn}
                disabled={selectedSet.size === 0}
                onClick={handleConfirm}
              >
                Bestätigen ✓
              </button>
            )}
          </>
        )}

        {/* Kat 5: Empathie Multi-Select */}
        {type === 'empathie-reaktion' && (
          <>
            <div className={styles.multiGrid}>
              {karte.optionen.map((opt, i) => {
                const isSelected = selectedSet.has(i)
                let cls = styles.multiBtn
                if (confirmed) {
                  if (opt.richtig)  cls += ' ' + styles.multiBtnKorrekt
                  else if (isSelected) cls += ' ' + styles.multiBtnFalsch
                } else if (isSelected) {
                  cls += ' ' + styles.multiBtnSelected
                }
                return (
                  <button key={i} className={cls} onClick={() => handleMultiToggle(i)} disabled={confirmed}>
                    <span className={styles.multiBtnEmoji}>{opt.emoji}</span>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>
            {!confirmed && (
              <button
                className={styles.bestaetigenBtn}
                disabled={selectedSet.size === 0}
                onClick={handleConfirm}
              >
                Bestätigen ✓
              </button>
            )}
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`${styles.feedbackBanner} ${feedback.ok ? styles.feedbackGreen : styles.feedbackRed}`}>
            <span className={styles.feedbackIcon}>{feedback.ok ? '✅' : '❌'}</span>
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Weiter */}
        {confirmed && (
          <button
            className={styles.weiterBtn}
            style={{ background: kat.color }}
            onClick={handleWeiter}
          >
            {idx + 1 >= TOTAL ? 'Ergebnis ansehen 🏆' : 'Weiter →'}
          </button>
        )}
      </div>
    </div>
  )
}
