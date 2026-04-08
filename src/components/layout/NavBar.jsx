import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import styles from './NavBar.module.css'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function NavBar() {
  const { profile } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/app" className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#4f46e5"/>
            <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
          </svg>
          <span>DeutschOcean</span>
        </NavLink>

        <div className={styles.links}>
          <NavLink to="/app" end className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
            Dashboard
          </NavLink>
          <NavLink to="/app/stats" className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
            📊 Stats
          </NavLink>
          <NavLink to="/app/chat" className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
            💬 Chat
          </NavLink>
        </div>

        <div className={styles.right}>
          {profile && (
            <>
              <div className={styles.xpChip}>
                <span>⚡</span>
                <span>{profile.xp ?? 0} XP</span>
              </div>
              <Link to="/app/profil" className={styles.avatarLink} title={`${profile.name} — Profil`}>
                {profile.avatar || '🐬'}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
