import React from 'react'
import styles from './ProgressBar.module.css'

export default function ProgressBar({ value = 0, max = 100, color = 'primary', label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
