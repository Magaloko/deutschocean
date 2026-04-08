import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import styles from './MobileNav.module.css'

export default function MobileNav() {
  const { profile } = useAuth()

  return (
    <nav className={styles.nav} aria-label="Hauptmenü">
      <NavLink
        to="/app"
        end
        className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
      >
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>Spielen</span>
      </NavLink>

      <NavLink
        to="/app/profil"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
      >
        <span className={styles.icon}>{profile?.avatar || '🐬'}</span>
        <span className={styles.label}>Profil</span>
      </NavLink>
    </nav>
  )
}
