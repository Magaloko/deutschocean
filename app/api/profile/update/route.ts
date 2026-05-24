import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db/client'

const ALLOWED_FIELDS = ['name', 'avatar', 'school_module'] as const

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  const body: Record<string, unknown> = await req.json()
  const updates: { field: string; value: unknown }[] = []

  for (const [key, value] of Object.entries(body)) {
    const dbKey = key === 'schoolModule' ? 'school_module' : key
    if ((ALLOWED_FIELDS as readonly string[]).includes(dbKey) && typeof value === 'string' && value.length < 200) {
      updates.push({ field: dbKey, value })
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Keine gültigen Felder' }, { status: 400 })
  }

  const setClause = updates.map((u, i) => `${u.field} = $${i + 2}`).join(', ')
  const values = updates.map(u => u.value)
  await query(`UPDATE sebo.users SET ${setClause} WHERE id = $1`, [session.user.id, ...values])

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  // Cascade deletes alles über FK
  await query('DELETE FROM sebo.users WHERE id=$1', [session.user.id])
  return NextResponse.json({ ok: true })
}
