import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import NavBar from './NavBar.jsx'
import MobileNav from './MobileNav.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import Spinner from '../ui/Spinner.jsx'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <Spinner size="xl" />
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/start" replace />
  }

  return (
    <div className={styles.layout}>
      <NavBar />
      {/* key on pathname forces remount → triggers routeEnter animation */}
      <main key={location.pathname} className={`${styles.main} ${styles.routeEnter}`}>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
