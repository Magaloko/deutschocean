import React, { useEffect } from 'react'
import Icon from './Icon.jsx'
import Confetti from './Confetti.jsx'
import styles from './CelebrationOverlay.module.css'

// Ganzseitiger Feier-Overlay mit Confetti, Icon, Titel und optional
// Untertitel. Dismiss per Klick oder automatisch nach `autoDismissMs`.
//
// Verwendung:
//   {showCelebration && (
//     <CelebrationOverlay
//       icon="🏆"
//       title="Fall gelöst!"
//       subtitle="Du hast den Park-Dieb überführt."
//       onDismiss={() => setShowCelebration(false)}
//     />
//   )}
export default function CelebrationOverlay({
  icon = '🎉',
  title,
  subtitle,
  color = '#f59e0b',
  autoDismissMs = 4000,
  onDismiss,
}) {
  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return
    const t = setTimeout(onDismiss, autoDismissMs)
    return () => clearTimeout(t)
  }, [autoDismissMs, onDismiss])

  return (
    <div className={styles.overlay} onClick={onDismiss} role="dialog" aria-live="assertive">
      <Confetti count={90} durationMs={3000} />
      <div className={styles.card}>
        <div className={styles.iconWrap} style={{ background: `${color}22`, color }}>
          <Icon emoji={icon} size={72} color={color} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <button type="button" className={styles.dismissBtn} onClick={onDismiss}>
          <Icon emoji="✓" size={16} color="#fff" /> Weiter
        </button>
      </div>
    </div>
  )
}
