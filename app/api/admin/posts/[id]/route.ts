import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const post = await queryOne(
    `SELECT id, slug, title, content, excerpt, cover_image, tags, published, created_at, updated_at
     FROM sebo.posts WHERE id=$1`, [id]
  )
  if (!post) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

  return NextResponse.json(post)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const fields = ['title','content','excerpt','cover_image','published','tags','slug']
  const updates: string[] = []
  const values: unknown[] = [id]

  for (const f of fields) {
    if (body[f] !== undefined) {
      updates.push(`${f} = $${values.length + 1}`)
      values.push(body[f])
    }
  }

  if (updates.length === 0) return NextResponse.json({ error: 'Nichts zu ändern' }, { status: 400 })

  await query(`UPDATE sebo.posts SET ${updates.join(', ')} WHERE id=$1`, values)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await query('DELETE FROM sebo.posts WHERE id=$1', [id])
  return NextResponse.json({ ok: true })
}
