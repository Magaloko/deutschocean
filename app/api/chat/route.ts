import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'
import { chatWithTutor } from '@/lib/ai/deepseek'
import type { DashboardProfile } from '@/types'

const DAILY_LIMIT = 20

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id

  // Rate-Limit prüfen
  const rateRow = await queryOne<{ count: number }>(
    `INSERT INTO sebo.chat_rate_limit (user_id, date, count)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (user_id, date) DO UPDATE SET count = sebo.chat_rate_limit.count + 1
     RETURNING count`,
    [userId]
  )

  if ((rateRow?.count ?? 0) > DAILY_LIMIT) {
    return NextResponse.json(
      { error: 'Tageslimit erreicht', limit: DAILY_LIMIT },
      { status: 429 }
    )
  }

  const { message } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Leere Nachricht' }, { status: 400 })
  }

  // Vollständiges Profil für Tool-Calling laden
  const profile = await loadProfile(userId)
  if (!profile) {
    return NextResponse.json({ error: 'Profil nicht gefunden' }, { status: 404 })
  }

  // Letzte 10 Chat-Nachrichten als Kontext laden
  const history = await query<{ role: string; content: string }>(
    `SELECT role, content FROM sebo.chat_messages
     WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10`,
    [userId]
  )
  const messages = history.reverse().map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
  messages.push({ role: 'user', content: message })

  // Usernachricht speichern
  await query(
    'INSERT INTO sebo.chat_messages (user_id, role, content) VALUES ($1,$2,$3)',
    [userId, 'user', message]
  )

  // DeepSeek aufrufen
  const reply = await chatWithTutor(messages, profile)

  // Antwort speichern
  await query(
    'INSERT INTO sebo.chat_messages (user_id, role, content) VALUES ($1,$2,$3)',
    [userId, 'assistant', reply]
  )

  return NextResponse.json({ reply, remaining: DAILY_LIMIT - (rateRow?.count ?? 1) })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const messages = await query<{ id: string; role: string; content: string; created_at: string }>(
    `SELECT id, role, content, created_at FROM sebo.chat_messages
     WHERE user_id=$1 ORDER BY created_at ASC LIMIT 50`,
    [session.user.id]
  )

  return NextResponse.json({ messages })
}

async function loadProfile(userId: string): Promise<DashboardProfile | null> {
  const user = await queryOne<DashboardProfile & Record<string, unknown>>(
    `SELECT id, email, name, avatar, school_module as "schoolModule", is_admin as "isAdmin",
            xp, stars, streak_days as "streakDays", last_active as "lastActive",
            total_hints as "totalHints", created_at as "createdAt"
     FROM sebo.users WHERE id=$1`,
    [userId]
  )
  if (!user) return null

  const [completed, badges, sr, weak, campaigns] = await Promise.all([
    query<{ mission_id: string }>('SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1', [userId]),
    query<{ badge_id: string }>('SELECT badge_id FROM sebo.user_badges WHERE user_id=$1', [userId]),
    query<{ mission_id: string; interval: number; ease_factor: string; repetitions: number; next_due: string }>(
      'SELECT mission_id, interval, ease_factor, repetitions, next_due FROM sebo.spaced_repetition WHERE user_id=$1', [userId]
    ),
    query<{ mission_id: string; count: number }>('SELECT mission_id, count FROM sebo.weak_games WHERE user_id=$1', [userId]),
    query<{ campaign_id: string; step_index: number; choices: Record<string,string>; completed: boolean }>(
      'SELECT campaign_id, step_index, choices, completed FROM sebo.campaign_progress WHERE user_id=$1', [userId]
    ),
  ])

  return {
    ...user,
    completedMissions: completed.map(r => r.mission_id),
    unlockedBadges: badges.map(r => r.badge_id),
    spacedRepetition: sr.map(r => ({
      missionId: r.mission_id,
      interval: r.interval,
      easeFactor: Number(r.ease_factor),
      repetitions: r.repetitions,
      nextDue: r.next_due,
    })),
    weakGames: weak.map(r => ({ missionId: r.mission_id, count: r.count })),
    campaignProgress: campaigns.map(r => ({
      campaignId: r.campaign_id,
      stepIndex: r.step_index,
      choices: r.choices,
      completed: r.completed,
    })),
  }
}
