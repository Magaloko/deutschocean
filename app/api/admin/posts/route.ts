import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query, queryOne } from '@/lib/db/client'

function slugify(title: string): string {
  return title.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 100)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const posts = await query<{
    id: string; slug: string; title: string; published: boolean
    created_at: string; updated_at: string
  }>(`SELECT id, slug, title, published, created_at, updated_at
      FROM sebo.posts ORDER BY updated_at DESC LIMIT 200`)

  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titel fehlt' }, { status: 400 })

  let slug = slugify(title)
  // Slug eindeutig machen
  const existing = await queryOne('SELECT id FROM sebo.posts WHERE slug=$1', [slug])
  if (existing) slug = `${slug}-${Date.now()}`

  const post = await queryOne<{ id: string }>(
    `INSERT INTO sebo.posts (slug, title, content, author_id, published)
     VALUES ($1, $2, '', $3, false) RETURNING id`,
    [slug, title, session.user.id]
  )

  return NextResponse.json({ id: post?.id, slug }, { status: 201 })
}
