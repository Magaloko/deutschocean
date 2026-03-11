import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import NavBar from './NavBar.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import Spinner from '../ui/Spinner.jsx'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const { profile, loading } = useAuth()

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
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
