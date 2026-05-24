import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/client'
import { sendStreakReminderEmail } from '@/lib/email/brevo'

// N8N ruft diesen Endpoint täglich ab (z.B. 18:00 Uhr)
// und triggert Streak-Reminder für inaktive User
export async function POST(req: NextRequest) {
  // Webhook-Key prüfen
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action } = await req.json()

  if (action === 'streak-reminders') {
    // User finden, die heute noch nicht aktiv waren und mindestens 2 Streak-Tage haben
    const usersToRemind = await query<{
      email: string; name: string; streak_days: number
    }>(
      `SELECT email, name, streak_days
       FROM sebo.users
       WHERE last_active < CURRENT_DATE
         AND streak_days >= 2
         AND email IS NOT NULL
       LIMIT 500`
    )

    let sent = 0
    const errors: string[] = []

    for (const user of usersToRemind) {
      try {
        await sendStreakReminderEmail(user.email, user.name, user.streak_days)
        sent++
      } catch (err) {
        errors.push(`${user.email}: ${err}`)
      }
    }

    return NextResponse.json({ ok: true, sent, errors: errors.slice(0, 10) })
  }

  return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })
}
