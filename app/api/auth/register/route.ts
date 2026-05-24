import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { query, queryOne } from '@/lib/db/client'
import { sendWelcomeEmail } from '@/lib/email/brevo'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Alle Felder sind pflicht' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Passwort mindestens 8 Zeichen' }, { status: 400 })
  }

  const exists = await queryOne('SELECT id FROM sebo.users WHERE email=$1', [email])
  if (exists) {
    return NextResponse.json({ error: 'E-Mail bereits vergeben' }, { status: 409 })
  }

  const passwordHash = await hash(password, 12)

  const user = await queryOne<{ id: string }>(
    `INSERT INTO sebo.users (email, password_hash, name)
     VALUES ($1,$2,$3) RETURNING id`,
    [email, passwordHash, name]
  )

  // Willkommens-Mail asynchron senden (nicht auf Ergebnis warten)
  sendWelcomeEmail(email, name).catch(err =>
    console.error('[register] Willkommens-Mail fehlgeschlagen:', err)
  )

  return NextResponse.json({ ok: true, userId: user?.id }, { status: 201 })
}
