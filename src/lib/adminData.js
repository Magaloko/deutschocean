// Admin-Data-Loader — lädt alle User-Profile aus Firestore (nur für Admins).
//
// Firestore-Rules müssen `list` auf /users für Admins erlauben.

import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db, FIREBASE_CONFIGURED } from './firebase.js'

export async function fetchAllUsers() {
  if (!FIREBASE_CONFIGURED) return []
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Jüngst aktive User (sortiert nach updatedAt desc).
// Nützlich für "Live-Feed" auf dem Admin-Dashboard.
export async function fetchRecentUsers(max = 25) {
  if (!FIREBASE_CONFIGURED) return []
  try {
    const q = query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(max))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    // Fallback: falls Firestore kein Index für orderBy hat, lade alle und sortiere lokal.
    console.warn('[admin] orderBy fehlgeschlagen, lokales Fallback:', err.code || err.message)
    const all = await fetchAllUsers()
    return all
      .slice()
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, max)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Aggregat-Statistik über eine User-Liste. Wird client-seitig berechnet —
// reicht bis ~5.000 User problemlos. Für größere Datenmengen wäre ein
// Firebase-Cloud-Function-Aggregat besser.

export function computeStats(users) {
  const today = toLocalDateStr()
  const weekAgo = toLocalDateStr(daysAgo(7))

  const stats = {
    totalUsers: users.length,
    registered: 0,
    anonymous: 0,
    activeToday: 0,
    activeThisWeek: 0,
    totalXp: 0,
    totalStars: 0,
    totalCompletedMissions: 0,
    totalHintsUsed: 0,
    byModule: { kindergarten: 0, volksschule: 0, hauptschule: 0 },
    topByXp: [],
    longestStreak: 0,
    badgeCount: 0,
  }

  for (const u of users) {
    if (u.isAnonymous) stats.anonymous++
    else stats.registered++

    const mod = u.schoolModule || 'volksschule'
    if (mod in stats.byModule) stats.byModule[mod]++

    stats.totalXp               += Number(u.xp || 0)
    stats.totalStars            += Number(u.stars || 0)
    stats.totalCompletedMissions += Array.isArray(u.completedMissions) ? u.completedMissions.length : 0
    stats.totalHintsUsed        += Number(u.totalHintsUsed || 0)
    stats.badgeCount            += Array.isArray(u.unlockedBadges) ? u.unlockedBadges.length : 0

    if (u.streakDays && u.streakDays > stats.longestStreak) stats.longestStreak = u.streakDays

    const last = u.lastActiveDate || ''
    const lastStr = last.length === 10 ? last : (last ? last.slice(0, 10) : '')
    if (lastStr === today) stats.activeToday++
    if (lastStr >= weekAgo) stats.activeThisWeek++
  }

  stats.topByXp = users
    .slice()
    .sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0))
    .slice(0, 10)

  return stats
}

// ── Helpers ────────────────────────────────────────────────────────────────
function toLocalDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '—'
  }
}

export function formatRelative(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'gerade eben'
  if (mins < 60) return `vor ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `vor ${days} T`
  return formatDate(iso)
}
