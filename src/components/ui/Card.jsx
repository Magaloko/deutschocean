import React from 'react'
import styles from './Card.module.css'

export default function Card({ children, padding = 'md', className = '', onClick, hoverable = false }) {
  return (
    <div
      className={`${styles.card} ${styles[`pad-${padding}`]} ${hoverable ? styles.hoverable : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
