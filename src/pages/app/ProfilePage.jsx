// src/pages/app/ProfilePage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import { BADGES } from '../../lib/gameData.js'
import styles from './ProfilePage.module.css'

const AVATARS = ['🐬', '🦁', '🦊', '🐸', '🦄', '🐧', '🦋', '🐼', '🦖', '🐙']
const MODULES = [
  { id: 'kindergarten', emoji: '🧒', label: 'Kindergarten',    color: '#ec4899' },
  { id: 'volksschule',  emoji: '📚', label: 'Volksschule',     color: '#4f46e5' },
  { id: 'hauptschule',  emoji: '🎓', label: 'Hauptschule/NMS', color: '#f97316' },
]

export default function ProfilePage() {
  const { profile, logout, setProfile } = useAuth()
  const navigate = useNavigate()
  const [editAvatar, setEditAvatar] = useState(false)
  const [editModule, setEditModule] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingModule, setSavingModule] = useState(false)

  if (!profile) return null

  const level      = Math.floor((profile.xp ?? 0) / 100) + 1
  const xpInLevel  = (profile.xp ?? 0) % 100
  const totalDone  = (profile.completedMissions ?? []).length
  const earnedBadges = BADGES.filter(b => (profile.unlockedBadges ?? []).includes(b.id))

  async function handleAvatarChange(a) {
    setSavingAvatar(true)
    try {
      await setProfile({ avatar: a })
      setEditAvatar(false)
    } finally {
      setSavingAvatar(false)
    }
  }

  async function handleModuleChange(m) {
    setSavingModule(true)
    try {
      await setProfile({ schoolModule: m })
      setEditModule(false)
    } finally {
      setSavingModule(false)
    }
  }

  async function handleLogout() {
    try {
      await logout()
      navigate('/start')
    } catch {
      // Ignore logout errors — navigate anyway
      navigate('/start')
    }
  }

  const mod = MODULES.find(m => m.id === profile.schoolModule) ?? MODULES[1]

  return (
    <div className={`${styles.page} fade-in`}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>←</button>
        <h1 className={styles.heading}>Mein Profil</h1>
        <div />
      </div>

      {/* ── Identity card ── */}
      <div className={styles.identityCard}>
        <button className={styles.avatarBig} onClick={() => setEditAvatar(v => !v)} title="Avatar ändern">
          {profile.avatar || '🐬'}
        </button>
        <div className={styles.identityInfo}>
          <div className={styles.identityName}>{profile.name}</div>
          <div className={styles.identityMeta}>
            <span style={{ color: mod.color }}>{mod.emoji} {mod.label}</span>
            {profile.isAnonymous && <span className={styles.guestBadge}>🔒 Gast</span>}
          </div>
        </div>
      </div>

      {/* Avatar picker */}
      {editAvatar && (
        <div className={styles.avatarPicker}>
          {AVATARS.map(a => (
            <button key={a} className={`${styles.avatarOpt} ${profile.avatar === a ? styles.avatarOptSelected : ''}`}
              onClick={() => handleAvatarChange(a)} disabled={savingAvatar}>{a}</button>
          ))}
        </div>
      )}

      {/* ── Upgrade banner (anonymous only) ── */}
      {profile.isAnonymous && (
        <Link to="/registrieren?upgrade=true" className={styles.upgradeBanner}>
          <span>🔐</span>
          <div>
            <div className={styles.upgradeTitle}>Fortschritt sichern!</div>
            <div className={styles.upgradeSub}>Erstelle ein kostenloses Konto — kein Datenverlust.</div>
          </div>
          <span className={styles.upgradeArrow}>→</span>
        </Link>
      )}

      {/* ── Stats ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statVal}>{profile.xp ?? 0}</div>
          <div className={styles.statLabel}>⚡ XP</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal}>{profile.stars ?? 0}</div>
          <div className={styles.statLabel}>⭐ Sterne</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statVal}>{totalDone}</div>
          <div className={styles.statLabel}>🏅 Gespielt</div>
        </div>
      </div>

      <div className={styles.levelWrap}>
        <div className={styles.levelLabel}>Level {level} — noch {100 - xpInLevel} XP bis Level {level + 1}</div>
        <ProgressBar value={xpInLevel} max={100} color="purple" />
      </div>

      {/* ── Badges ── */}
      {earnedBadges.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎖️ Abzeichen</h2>
          <div className={styles.badgeGrid}>
            {earnedBadges.map(b => (
              <div key={b.id} className={styles.badgeCard} title={b.description}>
                <div className={styles.badgeIcon}>{b.icon}</div>
                <div className={styles.badgeName}>{b.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Settings ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>⚙️ Einstellungen</h2>

        <button className={styles.settingRow} onClick={() => setEditModule(v => !v)}>
          <span>🏫 Schulstufe</span>
          <span className={styles.settingVal}>{mod.emoji} {mod.label} ›</span>
        </button>

        {editModule && (
          <div className={styles.moduleOptions}>
            {MODULES.map(m => (
              <button key={m.id} className={`${styles.moduleOpt} ${profile.schoolModule === m.id ? styles.moduleOptActive : ''}`}
                style={{ '--mc': m.color }} onClick={() => handleModuleChange(m.id)} disabled={savingModule}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        )}

        <button className={styles.logoutRow} onClick={handleLogout}>
          🚪 Abmelden
        </button>
      </section>
    </div>
  )
}
