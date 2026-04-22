import React from 'react'
import Icon from './Icon.jsx'
import styles from './MasteryBadge.module.css'

// Visualisiert den Mastery-Rang einer Welt (oder gesamt).
// Prensky Kap. 7: "Leveling up" als sichtbares Gefühl, besser zu werden.
//
// Props:
//   mastery:   { rank, nextRank, progress, plays, totalMissions }
//   size:      'sm' | 'md' | 'lg' (default 'md')
//   showProgress: boolean — Progress-Bar zum nächsten Rang anzeigen
export default function MasteryBadge({ mastery, size = 'md', showProgress = true }) {
  if (!mastery) return null
  const { rank, nextRank, progress, plays } = mastery

  const iconSize   = size === 'lg' ? 28 : size === 'sm' ? 14 : 20
  const labelClass = size === 'lg' ? styles.labelLg : size === 'sm' ? styles.labelSm : styles.labelMd

  return (
    <div className={`${styles.badge} ${styles[`size_${size}`]}`} style={{ '--rank-color': rank.color }}>
      <div className={styles.iconWrap}>
        <Icon emoji={rank.icon} size={iconSize} color={rank.color} />
      </div>
      <div className={styles.body}>
        <span className={labelClass}>{rank.label}</span>
        {showProgress && nextRank && (
          <div className={styles.progressRow}>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <span className={styles.hint}>→ {nextRank.label}</span>
          </div>
        )}
        {showProgress && !nextRank && (
          <span className={styles.maxedOut}>Maximaler Rang · {plays} gespielt</span>
        )}
      </div>
    </div>
  )
}
