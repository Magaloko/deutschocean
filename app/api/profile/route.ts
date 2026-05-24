import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db/client'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const userId = session.user.id

  const [completed, weakGames, sr] = await Promise.all([
    query<{ mission_id: string }>(
      'SELECT mission_id FROM sebo.completed_missions WHERE user_id=$1',
      [userId]
    ),
    query<{ mission_id: string; count: number }>(
      'SELECT mission_id, count FROM sebo.weak_games WHERE user_id=$1',
      [userId]
    ),
    query<{ mission_id: string; interval: number; ease_factor: string; repetitions: number; next_due: string }>(
      'SELECT mission_id, interval, ease_factor, repetitions, next_due FROM sebo.spaced_repetition WHERE user_id=$1',
      [userId]
    ),
  ])

  return NextResponse.json({
    completedMissions: completed.map(r => r.mission_id),
    weakGames: weakGames.map(r => ({ missionId: r.mission_id, count: r.count })),
    spacedRepetition: sr.map(r => ({
      missionId:   r.mission_id,
      interval:    r.interval,
      easeFactor:  Number(r.ease_factor),
      repetitions: r.repetitions,
      nextDue:     r.next_due,
    })),
  })
}
