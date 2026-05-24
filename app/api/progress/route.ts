import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'
import { sm2Next } from '@/lib/learning/spacedRepetition'
import type { GameSessionResult } from '@/types'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id
  const body: GameSessionResult = await req.json()
  const { missionId, accuracy, xpEarned, starsEarned, hintsUsed, answerSpeedMs, riskProfile } = body

  // Alle Updates in einer Transaktion
  await query('BEGIN')

  try {
    // 1. Session loggen
    await query(
      `INSERT INTO sebo.game_sessions
         (user_id, mission_id, accuracy, xp_earned, stars_earned, hints_used, answer_speed_ms, risk_profile)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [userId, missionId, accuracy, xpEarned, starsEarned, hintsUsed, answerSpeedMs ?? null, riskProfile ?? null]
    )

    // 2. XP, Stars, Hints akkumulieren + lastActive (löst Streak-Trigger aus)
    await query(
      `UPDATE sebo.users SET
         xp          = xp + $1,
         stars       = stars + $2,
         total_hints = total_hints + $3,
         last_active = CURRENT_DATE
       WHERE id = $4`,
      [xpEarned, starsEarned, hintsUsed, userId]
    )

    // 3. Mission als abgeschlossen markieren (UNIQUE ignoriert Duplikate)
    await query(
      `INSERT INTO sebo.completed_missions (user_id, mission_id)
       VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [userId, missionId]
    )

    // 4. Weak-Game-Tracking
    if (accuracy < 0.6) {
      await query(
        `INSERT INTO sebo.weak_games (user_id, mission_id, count)
         VALUES ($1,$2,1)
         ON CONFLICT (user_id, mission_id) DO UPDATE SET count = sebo.weak_games.count + 1`,
        [userId, missionId]
      )
    } else {
      // Bei guter Performance: Reset
      await query(
        `UPDATE sebo.weak_games SET count = 0 WHERE user_id=$1 AND mission_id=$2`,
        [userId, missionId]
      )
    }

    // 5. Spaced Repetition (SM-2)
    const existing = await queryOne<{
      interval: number; ease_factor: number; repetitions: number
    }>(
      'SELECT interval, ease_factor, repetitions FROM sebo.spaced_repetition WHERE user_id=$1 AND mission_id=$2',
      [userId, missionId]
    )

    const next = sm2Next(
      accuracy,
      existing
        ? { interval: existing.interval, easeFactor: Number(existing.ease_factor), repetitions: existing.repetitions }
        : undefined
    )

    await query(
      `INSERT INTO sebo.spaced_repetition (user_id, mission_id, interval, ease_factor, repetitions, next_due)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, mission_id) DO UPDATE SET
         interval=EXCLUDED.interval, ease_factor=EXCLUDED.ease_factor,
         repetitions=EXCLUDED.repetitions, next_due=EXCLUDED.next_due, updated_at=now()`,
      [userId, missionId, next.interval, next.easeFactor, next.repetitions, next.nextDue]
    )

    // 6. Badge-Check (XP-basiert)
    const user = await queryOne<{ xp: number }>(
      'SELECT xp FROM sebo.users WHERE id=$1',
      [userId]
    )
    const newBadges = checkXpBadges(user?.xp ?? 0)
    for (const badgeId of newBadges) {
      await query(
        `INSERT INTO sebo.user_badges (user_id, badge_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [userId, badgeId]
      )
    }

    await query('COMMIT')

    return NextResponse.json({ ok: true, newBadges })
  } catch (err) {
    await query('ROLLBACK')
    console.error('[progress] Fehler:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// XP-Schwellen aus dem Original-Badge-System
function checkXpBadges(xp: number): string[] {
  const milestones: Record<number, string> = {
    100:  'erste-schritte',
    500:  'auf-kurs',
    1000: 'taucher',
    2500: 'navigator',
    5000: 'kapitaen',
  }
  return Object.entries(milestones)
    .filter(([threshold]) => xp >= Number(threshold))
    .map(([, id]) => id)
}
