import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useRecommendedPosts } from '../../hooks/useRecommendedPosts.js'
import PostCard from '../../components/blog/PostCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import Icon from '../../components/ui/Icon.jsx'
import CelebrationOverlay from '../../components/ui/CelebrationOverlay.jsx'
import { MISSIONS, BADGES } from '../../lib/gameData.js'
import { FAECHER } from '../../lib/fachData.js'
import { WELTEN, GAME_ROUTES, isWeltForModule, getMaxMissionLevel } from '../../lib/weltenData.js'
import { CAMPAIGNS, getCampaignStatus, isCampaignForModule } from '../../lib/campaignsData.js'
import { isDueToday } from '../../lib/spacedRepetition.js'
import { playStreak } from '../../lib/sounds.js'
import styles from './DashboardPage.module.css'

// SessionStorage-Key verhindert, dass die Streak-Celebration bei jeder
// Dashboard-Rückkehr feuert — nur 1× pro Browser-Session.
const STREAK_CELEBRATED_KEY = 'streakCelebratedOn'

const MODULE_META = {
  kindergarten: { emoji: '🧒', label: 'Kindergarten',    color: '#ec4899' },
  volksschule:  { emoji: '📚', label: 'Volksschule',      color: '#4f46e5' },
  hauptschule:  { emoji: '🎓', label: 'Hauptschule/NMS',  color: '#f97316' },
}

// Zählt Varianten + gelöste Varianten über alle Missionen einer Welt.
// Berücksichtigt das Schulmodul: für KiGa-Kinder werden nur Level-0-Missionen
// gezählt (sonst hieße die Mathe-Welt "0/21 — würde KiGa frustrieren).
function getWeltProgress(welt, completed, schoolModule) {
  const maxLevel = getMaxMissionLevel(schoolModule)
  let total = 0
  let done  = 0
  let gameCount = 0
  const seenTypes = new Set()
  for (const m of MISSIONS) {
    if (!welt.gameTypes.includes(m.type)) continue
    if ((m.level ?? 0) > maxLevel) continue
    if (!seenTypes.has(m.type)) { seenTypes.add(m.type); gameCount++ }
    total++
    if (completed.includes(m.id)) done++
  }
  return { total, done, gameCount }
}

function getTagesaufgabe(completed, schoolModule) {
  const maxLevel = getMaxMissionLevel(schoolModule)
  const all = []
  for (const m of MISSIONS) {
    if (!GAME_ROUTES[m.type]) continue
    // KiGa darf keine Tagesaufgabe für Einmaleins/Subtraktion bekommen.
    if ((m.level ?? 0) > maxLevel) continue
    const alreadySeen = all.find((g) => g.type === m.type)
    if (!alreadySeen) all.push(m)
  }
  const uncompleted = all.filter((m) => !completed.includes(m.id))
  if (!uncompleted.length) return null
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return uncompleted[dayOfYear % uncompleted.length]
}

export default function DashboardPage() {
  const { profile } = useAuth()

  const xp           = profile?.xp ?? 0
  const stars        = profile?.stars ?? 0
  const streakDays   = profile?.streakDays ?? 0
  const badges       = profile?.unlockedBadges ?? []
  const completed    = profile?.completedMissions ?? []
  const name         = profile?.name || 'Spieler'
  const schoolModule = profile?.schoolModule || 'volksschule'
  const level        = Math.floor(xp / 100) + 1
  const xpInLevel    = xp % 100
  const xpToNext     = 100 - xpInLevel
  const moduleMeta   = MODULE_META[schoolModule]

  const recommendedPosts = useRecommendedPosts(profile)
  const spacedRepetition = profile?.spacedRepetition ?? {}

  // Streak-Celebration: bei Streak ≥ 3 einmal pro Session feiern.
  // Markiert via sessionStorage — überlebt Navigation innerhalb des Tabs,
  // startet beim Schließen/Öffnen des Tabs neu.
  const [showStreakCelebration, setShowStreakCelebration] = useState(false)
  useEffect(() => {
    if (streakDays < 3) return
    const today = new Date().toISOString().slice(0, 10)
    if (sessionStorage.getItem(STREAK_CELEBRATED_KEY) === today) return
    sessionStorage.setItem(STREAK_CELEBRATED_KEY, today)
    // Kurze Verzögerung, damit das Dashboard zuerst rendert
    const t = setTimeout(() => {
      setShowStreakCelebration(true)
      playStreak()
    }, 600)
    return () => clearTimeout(t)
  }, [streakDays])

  const dueForReview = useMemo(() => {
    const maxLevel = getMaxMissionLevel(schoolModule)
    return MISSIONS.filter((m) => {
      if ((m.level ?? 0) > maxLevel) return false
      const sr = spacedRepetition[m.id]
      return sr && isDueToday(sr.nextReview) && GAME_ROUTES[m.type]
    }).slice(0, 4)
  }, [spacedRepetition, schoolModule])

  const featured = useMemo(() => getTagesaufgabe(completed, schoolModule), [completed, schoolModule])

  // Nur Welten, die für das aktuelle Schulmodul sichtbar sind.
  const visibleWelten = useMemo(
    () => WELTEN.filter((w) => isWeltForModule(w, schoolModule)),
    [schoolModule],
  )

  const featuredWelt = useMemo(() => {
    if (!featured) return null
    return WELTEN.find((w) => w.gameTypes.includes(featured.type))
  }, [featured])

  // Aktive/verfügbare Kampagnen für das Schulmodul des Users.
  // Zeige maximal 1 laufende + 1 verfügbare Kampagne auf dem Dashboard.
  const visibleCampaigns = useMemo(() => {
    const list = CAMPAIGNS
      .filter((c) => isCampaignForModule(c, schoolModule))
      .map((c) => ({ campaign: c, status: getCampaignStatus(c, profile) }))
    // Sortierung: in-progress > available > complete
    const rank = { 'in-progress': 0, 'available': 1, 'complete': 2 }
    list.sort((a, b) => rank[a.status.status] - rank[b.status.status])
    return list.slice(0, 2)
  }, [profile, schoolModule])

  return (
    <div className={`${styles.page} fade-in`}>
      {showStreakCelebration && (
        <CelebrationOverlay
          icon="🔥"
          title={`${streakDays} Tage in Folge!`}
          subtitle="Unaufhaltbar! Mach weiter so — du bist spitze."
          color="#ef4444"
          autoDismissMs={4200}
          onDismiss={() => setShowStreakCelebration(false)}
        />
      )}

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroWave}><Icon emoji="🌊" size={112} color="#fff" /></div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Hallo, {name}! <Icon emoji="👋" size={28} color="#fff" />
          </h1>
          <p className={styles.heroSub}>
            {streakDays >= 3
              ? <><Icon emoji="🔥" size={16} /> {streakDays} Tage in Folge — unaufhaltbar!</>
              : xp === 0
                ? 'Wähle eine Welt und leg los!'
                : xpInLevel < 50
                  ? `Noch ${xpToNext} XP bis Level ${level + 1}!`
                  : `Du bist auf Level ${level} — weiter so!`}
          </p>
          <div className={styles.modulePill} style={{ background: `${moduleMeta.color}20`, color: moduleMeta.color }}>
            <Icon emoji={moduleMeta.emoji} size={14} color={moduleMeta.color} /> {moduleMeta.label}
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{xp}</span>
            <span className={styles.heroStatLabel}><Icon emoji="⚡" size={14} color="#fff" /> XP</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{stars}</span>
            <span className={styles.heroStatLabel}><Icon emoji="⭐" size={14} color="#fff" /> Sterne</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{completed.length}</span>
            <span className={styles.heroStatLabel}><Icon emoji="🏅" size={14} color="#fff" /> Gespielt</span>
          </div>
          {streakDays > 0 && (
            <>
              <div className={styles.heroStatDiv} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{streakDays}</span>
                <span className={styles.heroStatLabel}><Icon emoji="🔥" size={14} color="#fff" /> Tage</span>
              </div>
            </>
          )}
        </div>
        <div className={styles.xpBarWrap}>
          <span className={styles.xpBarLabel}>Lvl {level}</span>
          <div style={{ flex: 1 }}>
            <ProgressBar value={xpInLevel} max={100} color="purple" />
          </div>
          <span className={styles.xpBarLabel}>Lvl {level + 1}</span>
        </div>
      </div>

      {/* ── Tagesaufgabe ── */}
      {featured && (
        <section className={styles.featuredSection}>
          <div className={styles.featuredBadge}>
            <Icon emoji="⭐" size={14} /> Tagesaufgabe
          </div>
          <Link
            to={GAME_ROUTES[featured.type]}
            className={styles.featuredCard}
            style={{ '--accent': featured.color }}
          >
            <div className={styles.featuredIcon}>
              <Icon emoji={featured.icon} size={48} color={featured.color} />
            </div>
            <div className={styles.featuredInfo}>
              <div className={styles.featuredTitle}>{featured.title}</div>
              <div className={styles.featuredDesc}>{featured.description}</div>
              <div className={styles.featuredMeta}>
                <Badge color="purple">+{featured.xp} XP</Badge>
                {featuredWelt && <Badge color="blue">{featuredWelt.title}</Badge>}
              </div>
              <button type="button" className={styles.featuredPlayBtn}>
                <Icon emoji="▶" size={14} color="#fff" /> JETZT SPIELEN
              </button>
            </div>
          </Link>
        </section>
      )}

      {/* ── Zum Wiederholen ── */}
      {dueForReview.length > 0 && (
        <section className={styles.reviewSection}>
          <div className={styles.reviewHeader}>
            <span className={styles.reviewLabel}>
              <Icon emoji="🔁" size={16} /> Heute wiederholen
            </span>
            <span className={styles.reviewCount}>{dueForReview.length} fällig</span>
          </div>
          <div className={styles.reviewGrid}>
            {dueForReview.map((m) => (
              <Link key={m.id} to={GAME_ROUTES[m.type]} className={styles.reviewCard}>
                <span className={styles.reviewIcon}>
                  <Icon emoji={m.icon} size={24} color={m.color} />
                </span>
                <span className={styles.reviewTitle}>{m.title}</span>
                <span className={styles.reviewArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Kampagnen ── */}
      {visibleCampaigns.length > 0 && (
        <section>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Icon emoji="🔍" size={22} color="#ef4444" /> Kampagnen
            </h2>
            <span className={styles.sectionHint}>Detektiv-Fälle in mehreren Schritten</span>
          </div>
          <div className={styles.campaignGrid}>
            {visibleCampaigns.map(({ campaign, status }) => (
              <Link
                key={campaign.id}
                to={`/app/kampagne/${campaign.id}`}
                className={styles.campaignCard}
                style={{ background: campaign.gradient, '--cc': campaign.color }}
              >
                <div className={styles.campaignIconWrap}>
                  <Icon emoji={campaign.icon} size={40} color="#fff" />
                </div>
                <div className={styles.campaignBody}>
                  <span className={styles.campaignTag}>
                    {status.status === 'complete' ? 'ABGESCHLOSSEN'
                      : status.status === 'in-progress' ? `SCHRITT ${status.currentStepIdx + 1} VON ${status.totalSteps}`
                      : 'NEU · 3 SCHRITTE'}
                  </span>
                  <div className={styles.campaignTitle}>{campaign.title}</div>
                  <div className={styles.campaignSub}>{campaign.subtitle}</div>
                  <div className={styles.campaignBar}>
                    <div
                      className={styles.campaignBarFill}
                      style={{ width: `${(status.completedSteps / status.totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
                <span className={styles.weltArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Artikel-Empfehlungen ── */}
      {recommendedPosts.length > 0 && (
        <section className={styles.recommendedSection}>
          <div className={styles.recommendedHeader}>
            <span className={styles.recommendedLabel}>
              <Icon emoji="📚" size={16} /> Für dich empfohlen
            </span>
            <Link to="/app/blog" className={styles.recommendedAll}>Alle Artikel →</Link>
          </div>
          <div className={styles.recommendedGrid}>
            {recommendedPosts.map(post => (
              <PostCard key={post.id} post={post} href={`/app/blog/${post.slug}`} />
            ))}
          </div>
        </section>
      )}

      {/* ── Deine Welten ── */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="🗺️" size={22} color="#4f46e5" /> Deine Welten
          </h2>
          <span className={styles.sectionHint}>{visibleWelten.length + FAECHER.length} Welten</span>
        </div>
        <div className={styles.weltenGrid}>
          {visibleWelten.map((welt) => {
            const { total, done, gameCount } = getWeltProgress(welt, completed, schoolModule)
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <Link
                key={welt.id}
                to={`/app/welt/${welt.id}`}
                className={styles.weltCard}
                style={{ background: welt.gradient, '--welt-color': welt.color }}
              >
                <div className={styles.weltIconWrap}>
                  <Icon emoji={welt.icon} size={44} color="#fff" />
                </div>
                <div className={styles.weltBody}>
                  <div className={styles.weltTitle}>{welt.title}</div>
                  <div className={styles.weltSub}>{welt.subtitle}</div>
                  <div className={styles.weltStats}>
                    <span>{gameCount} Spiele</span>
                    <span className={styles.weltDot}>·</span>
                    <span>{done}/{total} erledigt</span>
                  </div>
                  <div className={styles.weltBar}>
                    <div className={styles.weltBarFill} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className={styles.weltArrow}>→</span>
              </Link>
            )
          })}

          {/* Fach-Welten (Roboter, Coden, Mini-Boss, Cool) */}
          {FAECHER.map((f) => (
            <Link
              key={f.id}
              to={f.route}
              className={styles.weltCard}
              style={{ background: `linear-gradient(135deg, ${f.color} 0%, ${f.color}aa 100%)`, '--welt-color': f.color }}
            >
              <div className={styles.weltIconWrap}>
                <Icon emoji={f.emoji} size={44} color="#fff" />
              </div>
              <div className={styles.weltBody}>
                <div className={styles.weltTitle}>{f.title}</div>
                <div className={styles.weltSub}>{f.subtitle}</div>
                <div className={styles.weltStats}>
                  <span>3 Level · Quiz</span>
                </div>
                <div className={styles.weltFachTag}>
                  <Icon emoji="📖" size={11} color="#fff" /> {f.bookSource?.split(' For ')[0] || 'For Dummies'}
                </div>
              </div>
              <span className={styles.weltArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Abzeichen ── */}
      {badges.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>
            <Icon emoji="🎖️" size={22} /> Deine Abzeichen
          </h2>
          <div className={styles.badgeGrid}>
            {BADGES.filter((b) => badges.includes(b.id)).map((b) => (
              <div key={b.id} className={styles.badgeCard}>
                <div className={styles.badgeIcon}>
                  <Icon emoji={b.icon} size={36} color="#f59e0b" />
                </div>
                <div className={styles.badgeName}>{b.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
