import React from 'react'
import styles from './Spinner.module.css'

export default function Spinner({ size = 'md', color = 'primary' }) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]} ${styles[`color-${color}`]}`}
      aria-label="Lädt..."
      role="status"
    />
  )
}
