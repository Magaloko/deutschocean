import React from 'react'
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { profile, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) return null
  if (!profile?.isAdmin) return <Navigate to="/app" replace />

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
          <Link to="/admin/blog"
            className={`${styles.navLink} ${pathname.startsWith('/admin/blog') ? styles.navLinkActive : ''}`}>
            📝 Blog-Artikel
          </Link>
        </nav>
        <Link to="/app" className={styles.backToApp}>← Zurück zur App</Link>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
