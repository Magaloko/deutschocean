import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCampaign } from '../../hooks/useCampaign.js'
import Icon from '../../components/ui/Icon.jsx'
import Button from '../../components/ui/Button.jsx'
import CelebrationOverlay from '../../components/ui/CelebrationOverlay.jsx'
import { playFanfare } from '../../lib/sounds.js'
import {
  getCampaignById,
  getCampaignStatus,
  isCampaignForModule,
} from '../../lib/campaignsData.js'
import styles from './CampaignPage.module.css'

export default function CampaignPage() {
  const { campaignId } = useParams()
  const { profile }    = useAuth()
  const navigate       = useNavigate()
  const { startCampaign, claimReward, claiming, campaignProgress } = useCampaign()

  const campaign = getCampaignById(campaignId)

  // Auto-mark "startedAt" beim ersten Besuch (für Dashboard-Sortierung)
  useEffect(() => {
    if (!campaign || !profile) return
    const existing = campaignProgress[campaign.id]
    if (!existing?.startedAt) {
      startCampaign(campaign.id).catch(console.error)
    }
  }, [campaign, profile, campaignProgress, startCampaign])

  if (!campaign) return <Navigate to="/app" replace />
  const schoolModule = profile?.schoolModule || 'volksschule'
  if (!isCampaignForModule(campaign, schoolModule)) {
    return (
      <div className={styles.page}>
        <div className={styles.notAvailable}>
          <Icon emoji="🔒" size={48} color="#9ca3af" />
          <h1>Diese Kampagne ist für deine Schulstufe nicht verfügbar.</h1>
          <Link to="/app" className={styles.backLink}>
            <Icon emoji="←" size={16} /> Zurück zur Übersicht
          </Link>
        </div>
      </div>
    )
  }

  const { status, currentStepIdx, completedSteps, totalSteps } = getCampaignStatus(campaign, profile)
  const claimed = Boolean(campaignProgress[campaign.id]?.claimedAt)
  const completed = profile?.completedMissions ?? []

  const [showCelebration, setShowCelebration] = useState(false)

  async function handleClaim() {
    await claimReward(campaign)
    playFanfare()
    setShowCelebration(true)
  }

  return (
    <div className={`${styles.page} fade-in`}>
      {/* Hero */}
      <div className={styles.hero} style={{ background: campaign.gradient }}>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/app')}
          aria-label="Zurück"
        >
          <Icon emoji="←" size={22} color="#fff" />
        </button>
        <div className={styles.heroIcon}>
          <Icon emoji={campaign.icon} size={72} color="#fff" />
        </div>
        <div className={styles.heroText}>
          <span className={styles.heroTag}>KAMPAGNE</span>
          <h1 className={styles.heroTitle}>{campaign.title}</h1>
          <p className={styles.heroSub}>{campaign.subtitle}</p>
          <div className={styles.heroStats}>
            <span>{completedSteps}/{totalSteps} Schritte</span>
            <span>·</span>
            <span><Icon emoji="⚡" size={12} color="#fff" /> {campaign.reward.xp} XP Belohnung</span>
          </div>
        </div>
      </div>

      {/* Intro-Story */}
      <div className={styles.introCard}>
        <p className={styles.introText}>{campaign.intro}</p>
      </div>

      {/* Schritte */}
      <div className={styles.steps}>
        {campaign.steps.map((step, idx) => {
          const isDone     = completed.includes(step.missionId)
          const isCurrent  = !isDone && idx === currentStepIdx
          const isLocked   = !isDone && idx > currentStepIdx
          const connector  = idx < campaign.steps.length - 1

          return (
            <React.Fragment key={step.id}>
              <div
                className={`${styles.stepCard} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''} ${isLocked ? styles.stepLocked : ''}`}
                style={{ '--accent': campaign.color }}
              >
                <div className={styles.stepBadge}>
                  {isDone
                    ? <Icon emoji="✓" size={22} color="#fff" />
                    : isLocked
                      ? <Icon emoji="🔒" size={20} color="#9ca3af" />
                      : <span className={styles.stepNum}>{idx + 1}</span>}
                </div>

                <div className={styles.stepBody}>
                  <div className={styles.stepHeader}>
                    <Icon emoji={step.icon} size={22} color={campaign.color} />
                    <h2 className={styles.stepTitle}>{step.title}</h2>
                  </div>

                  <p className={styles.stepStory}>
                    {isDone ? step.storyOutro : step.storyIntro}
                  </p>

                  {isCurrent && (
                    <Link to={step.route} className={styles.stepPlayBtn} style={{ background: campaign.color }}>
                      <Icon emoji="▶" size={14} color="#fff" /> {step.gameLabel} starten
                    </Link>
                  )}
                  {isDone && (
                    <div className={styles.stepDoneBadge}>
                      <Icon emoji="✅" size={14} color="#10b981" /> Erledigt
                    </div>
                  )}
                  {isLocked && (
                    <div className={styles.stepLockedHint}>
                      Schritt {idx} zuerst lösen
                    </div>
                  )}
                </div>
              </div>

              {connector && (
                <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {showCelebration && (
        <CelebrationOverlay
          icon="🏆"
          title={campaign.reward.title}
          subtitle={`+${campaign.reward.xp} XP — ${campaign.reward.message}`}
          color={campaign.color}
          autoDismissMs={5500}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      {/* Belohnung */}
      {status === 'complete' && (
        <div className={styles.rewardCard}>
          {claimed ? (
            <>
              <Icon emoji="🏆" size={56} color="#ca8a04" />
              <h2 className={styles.rewardTitle}>{campaign.reward.title}</h2>
              <p className={styles.rewardText}>{campaign.reward.message}</p>
              <Link to="/app" className={styles.rewardBackLink}>
                <Icon emoji="←" size={14} /> Zurück zur Übersicht
              </Link>
            </>
          ) : (
            <>
              <Icon emoji="🎉" size={56} color="#f59e0b" />
              <h2 className={styles.rewardTitle}>Alle Schritte erledigt!</h2>
              <p className={styles.rewardText}>{campaign.reward.message}</p>
              <Button
                onClick={handleClaim}
                loading={claiming}
                size="lg"
                className={styles.claimBtn}
              >
                <Icon emoji="🎁" size={18} color="#fff" /> Belohnung einstreichen (+{campaign.reward.xp} XP)
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
