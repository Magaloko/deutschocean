import React from 'react'
import styles from './OzzyMascot.module.css'

const MOODS = {
  idle:      { face: '🐙' },
  correct:   { face: '🐙' },
  wrong:     { face: '🐙' },
  thinking:  { face: '🐙' },
  celebrate: { face: '🐙' },
  levelUp:   { face: '🐙' },
  levelDown: { face: '🐙' },
}

/**
 * Ozzy der Oktopus — Maskottchen für alle Spiele.
 *
 * @param {'idle'|'correct'|'wrong'|'thinking'|'celebrate'} mood
 * @param {string} [message] — optionale Sprechblase
 */
export default function OzzyMascot({ mood = 'idle', message }) {
  return (
    <div className={`${styles.ozzy} ${styles[`mood_${mood}`]}`}>
      <div className={styles.bubble}>
        {message && <p className={styles.bubbleText}>{message}</p>}
      </div>
      <div className={styles.character} aria-label="Ozzy der Oktopus" role="img">
        <span className={styles.face} aria-hidden="true">{MOODS[mood]?.face ?? '🐙'}</span>
      </div>
    </div>
  )
}
