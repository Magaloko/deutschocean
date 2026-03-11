import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { MEMORY_KARTEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCoin, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

// Karten-Anzahl pro innerem Level je Schwierigkeitsstufe
const LEVEL_SIZES_MAP = {
  1: [4, 6, 8],
  2: [4, 8, 12],
  3: [6, 10, 16],
}

const XP_MAP = { 1: 15, 2: 18, 3: 22 }

function buildCards(size) {
  const pairs = shuffle(MEMORY_KARTEN).slice(0, size / 2)
  const cards = []
  pairs.forEach(card => {
    cards.push({ uid: `${card.id}-a`, pairId: card.id, emoji: card.emoji, name: card.name })
    cards.push({ uid: `${card.id}-b`, pairId: card.id, emoji: card.emoji, name: card.name })
  })
  return shuffle(cards)
}

export default function MemorySpiel() {
  const navigate  = useNavigate()
  const { completeSession, saving } = useProgress()

  const [diffLevel,  setDiffLevel]  = useState(null) // null | 1 | 2 | 3  (äußere Schwierigkeit)
  const [level,      setLevel]      = useState(0)    // 0 | 1 | 2          (innerer Schritt)
  const [cards,      setCards]      = useState([])
  const [flipped,    setFlipped]    = useState([])
  const [matched,    setMatched]    = useState(new Set())
  const [moves,      setMoves]      = useState(0)
  const [locked,     setLocked]     = useState(false)
  const [levelDone,  setLevelDone]  = useState(false)
  const [phase,      setPhase]      = useState('playing')


  function startDiffLevel(dl) {
    const sizes = LEVEL_SIZES_MAP[dl]
    setDiffLevel(dl)
    setLevel(0)
    setCards(buildCards(sizes[0]))
    setFlipped([])
    setMatched(new Set())
    setMoves(0)
    setLocked(false)
    setLevelDone(false)
    setPhase('playing')
  }

  function handleCardClick(card) {
    if (locked)                   return
    if (matched.has(card.pairId)) return
    if (flipped.includes(card.uid)) return
    if (flipped.length >= 2)      return

    const next = [...flipped, card.uid]
    setFlipped(next)

    if (next.length === 2) {
      setMoves(m => m + 1)
      const [c1, c2] = next.map(uid => cards.find(c => c.uid === uid))
      if (c1.pairId === c2.pairId) {
        playCoin()
        const newMatched = new Set([...matched, c1.pairId])
        setMatched(newMatched)
        setFlipped([])
        if (newMatched.size === cards.length / 2) {
          setTimeout(() => setLevelDone(true), 400)
        }
      } else {
        playWrong()
        setLocked(true)
        setTimeout(() => { setFlipped([]); setLocked(false) }, 900)
      }
    }
  }

  function advanceLevel() {
    const sizes = LEVEL_SIZES_MAP[diffLevel]
    if (level + 1 >= sizes.length) {
      setPhase('result')
    } else {
      const nextLevel = level + 1
      setLevel(nextLevel)
      setCards(buildCards(sizes[nextLevel]))
      setFlipped([])
      setMatched(new Set())
      setMoves(0)
      setLevelDone(false)
      setLocked(false)
    }
  }

  async function handleFinish() {
    playComplete()
    await completeSession({ missionId: `memory-${diffLevel}`, xpEarned: XP_MAP[diffLevel], stars: 3, correct: 3, total: 3 })
    navigate('/app')
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>🃏</div>
        <h1 className={styles.resultTitle}>Memory Meister!</h1>
        <p className={styles.resultSub}>Alle 3 Level geschafft!</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+{XP_MAP[diffLevel]} XP</Badge>
          <Badge color="yellow">⭐⭐⭐</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app')} size="lg">Zurück</Button>
        </div>
      </div>
    )
  }

  // ── LEVEL-AUSWAHL ─────────────────────────────────────────────────────────
  if (!diffLevel) {
    return (
      <div className={`${styles.gamePage} fade-in`}>
        <div className={styles.gameHeader}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
          <div className={styles.gameInfo}>
            <span className={styles.gameEmoji}>🃏</span>
            <h1 className={styles.gameTitle}>Memory</h1>
          </div>
          <div />
        </div>
        <p className={styles.vehicleSelectTitle}>Wähle dein Level! 🌟</p>
        <div className={styles.levelGrid}>
          <button className={`${styles.levelCard} ${styles.levelCard1}`} onClick={() => startDiffLevel(1)}>
            <span className={styles.levelStars}>⭐</span>
            <strong className={styles.levelTitle}>Level 1</strong>
            <span className={styles.levelLabel}>Leicht</span>
          </button>
          <button
            className={`${styles.levelCard} ${styles.levelCard2}`}
            onClick={() => startDiffLevel(2)}
          >
            <span className={styles.levelStars}>⭐⭐</span>
            <strong className={styles.levelTitle}>Level 2</strong>
            <span className={styles.levelLabel}>Mittel</span>
          </button>
          <button
            className={`${styles.levelCard} ${styles.levelCard3}`}
            onClick={() => startDiffLevel(3)}
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
  const sizes = LEVEL_SIZES_MAP[diffLevel]
  const cols  = cards.length <= 4 ? 2 : cards.length === 6 ? 3 : 4

  return (
    <div className={`${styles.gamePage} fade-in`}>
      <div className={styles.gameHeader}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>← Zurück</Button>
        <div className={styles.gameInfo}>
          <span className={styles.gameEmoji}>🃏</span>
          <h1 className={styles.gameTitle}>Memory</h1>
        </div>
        <Badge color="gray">Level {level + 1}/3</Badge>
      </div>

      <Card padding="lg" className={styles.gameCard}>
        {levelDone ? (
          <div className={styles.levelBanner}>
            <div className={styles.levelBannerEmoji}>🎉</div>
            <h2 className={styles.levelBannerTitle}>Level {level + 1} geschafft!</h2>
            <Button onClick={advanceLevel} size="lg">
              {level + 1 >= sizes.length ? 'Fertig! 🏆' : `Level ${level + 2} →`}
            </Button>
          </div>
        ) : (
          <>
            <p className={styles.instruction}>
              Finde alle <strong>gleichen Paare</strong>! ({sizes[level] / 2} Paare)
            </p>

            <div
              className={styles.memoryGrid}
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {cards.map(card => {
                const isFlippedCard = flipped.includes(card.uid)
                const isMatchedCard = matched.has(card.pairId)
                const showFace      = isFlippedCard || isMatchedCard
                return (
                  <button
                    key={card.uid}
                    className={[
                      styles.memoryCard,
                      !showFace                    ? styles.memoryCardFaceDown : '',
                      showFace && !isMatchedCard   ? styles.memoryCardFlipped  : '',
                      isMatchedCard                ? styles.memoryCardMatched  : '',
                    ].join(' ')}
                    onClick={() => handleCardClick(card)}
                    disabled={isMatchedCard || locked}
                    aria-label={showFace ? card.name : 'Verdeckte Karte'}
                  >
                    {showFace ? card.emoji : ''}
                  </button>
                )
              })}
            </div>

            <p className={styles.memoryStats}>
              {moves} Versuche &nbsp;·&nbsp; {matched.size}/{cards.length / 2} Paare gefunden
            </p>
          </>
        )}
      </Card>

      <div className={styles.progressDots}>
        {sizes.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < level ? styles.dotDone : i === level ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
