import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import Button from '../../../components/ui/Button.jsx'
import Badge from '../../../components/ui/Badge.jsx'
import { MEMORY_KARTEN } from '../../../lib/gameData.js'
import { useProgress } from '../../../hooks/useProgress.jsx'
import { playCoin, playWrong, playComplete } from '../../../lib/sounds.js'
import styles from './Game.module.css'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

// Card counts per level: 4 → 8 → 12
const LEVEL_SIZES = [4, 8, 12]

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
  const navigate = useNavigate()
  const { completeSession, saving } = useProgress()

  const [level, setLevel]       = useState(0)
  const [cards, setCards]       = useState(() => buildCards(LEVEL_SIZES[0]))
  const [flipped, setFlipped]   = useState([])   // UIDs currently face-up (unmatched)
  const [matched, setMatched]   = useState(new Set()) // matched pairIds
  const [moves, setMoves]       = useState(0)
  const [locked, setLocked]     = useState(false)
  const [levelDone, setLevelDone] = useState(false)
  const [phase, setPhase]       = useState('playing')
  const isFirst = useRef(true)

  // Rebuild cards when level advances (skip on mount)
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    setCards(buildCards(LEVEL_SIZES[level]))
    setFlipped([])
    setMatched(new Set())
    setMoves(0)
    setLevelDone(false)
    setLocked(false)
  }, [level])

  function handleCardClick(card) {
    if (locked)               return
    if (matched.has(card.pairId)) return
    if (flipped.includes(card.uid)) return
    if (flipped.length >= 2)  return

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
    if (level + 1 >= LEVEL_SIZES.length) {
      setPhase('result')
    } else {
      setLevel(l => l + 1)
    }
  }

  async function handleFinish() {
    playComplete()
    await completeSession({ missionId: 'memory-1', xpEarned: 15, stars: 3, correct: 3, total: 3 })
    navigate('/app')
  }

  if (phase === 'result') {
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultEmoji}>🃏</div>
        <h1 className={styles.resultTitle}>Memory Meister!</h1>
        <p className={styles.resultSub}>Alle 3 Level geschafft!</p>
        <div className={styles.resultStats}>
          <Badge color="purple">+15 XP</Badge>
          <Badge color="yellow">⭐⭐⭐</Badge>
        </div>
        <div className={styles.resultActions}>
          <Button onClick={handleFinish} loading={saving} size="lg">Speichern</Button>
          <Button variant="secondary" onClick={() => navigate('/app/missionen')} size="lg">Andere Missionen</Button>
        </div>
      </div>
    )
  }

  // Grid columns: 2 for 4 cards, 4 for 8/12 cards
  const cols = cards.length <= 4 ? 2 : 4

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
              {level + 1 >= LEVEL_SIZES.length ? 'Fertig! 🏆' : `Level ${level + 2} →`}
            </Button>
          </div>
        ) : (
          <>
            <p className={styles.instruction}>
              Finde alle <strong>gleichen Paare</strong>! ({LEVEL_SIZES[level] / 2} Paare)
            </p>

            <div
              className={styles.memoryGrid}
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {cards.map(card => {
                const isFlipped  = flipped.includes(card.uid)
                const isMatched  = matched.has(card.pairId)
                const showFace   = isFlipped || isMatched
                return (
                  <button
                    key={card.uid}
                    className={[
                      styles.memoryCard,
                      !showFace ? styles.memoryCardFaceDown  : '',
                      showFace && !isMatched ? styles.memoryCardFlipped  : '',
                      isMatched ? styles.memoryCardMatched : '',
                    ].join(' ')}
                    onClick={() => handleCardClick(card)}
                    disabled={isMatched || locked}
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
        {LEVEL_SIZES.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i < level ? styles.dotDone : i === level ? styles.dotActive : ''}`} />
        ))}
      </div>
    </div>
  )
}
