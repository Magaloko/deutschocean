import React from 'react'
import { Outlet, Link, Navigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { profile, loading, isAdmin, authEmail } = useAuth()

  if (loading) return null
  if (!profile) return <Navigate to="/start" replace />
  if (!isAdmin) return <Navigate to="/app" replace />

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link to="/app" className={styles.sidebarLogo}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#4f46e5"/>
            <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
          </svg>
          <span>Admin</span>
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/admin" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
            👥 User
          </NavLink>
          <NavLink to="/admin/blog" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>
            📝 Blog
          </NavLink>
        </nav>

        {authEmail && (
          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarEmail} title={authEmail}>{authEmail}</div>
            <Link to="/app" className={styles.backToApp}>← Zurück zur App</Link>
          </div>
        )}
        {!authEmail && (
          <Link to="/app" className={styles.backToApp}>← Zurück zur App</Link>
        )}
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
