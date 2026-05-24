import { NextResponse } from 'next/server'
import { query } from '@/lib/db/client'

export async function GET() {
  const posts = await query<{
    id: string; slug: string; title: string; excerpt: string | null
    cover_image: string | null; tags: string[]; created_at: string
  }>(
    `SELECT id, slug, title, excerpt, cover_image, tags, created_at
     FROM sebo.posts WHERE published = true
     ORDER BY created_at DESC LIMIT 50`
  )

  return NextResponse.json({
    posts: posts.map(p => ({
      id: p.id, slug: p.slug, title: p.title,
      excerpt: p.excerpt, coverImage: p.cover_image,
      tags: p.tags ?? [], createdAt: p.created_at,
    })),
  })
}
