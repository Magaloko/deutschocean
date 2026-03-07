import React from 'react'
import styles from './Badge.module.css'

export default function Badge({ color = 'gray', children, size = 'md' }) {
  return (
    <span className={`${styles.badge} ${styles[color]} ${styles[size]}`}>
      {children}
    </span>
  )
}
