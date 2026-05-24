import { NextResponse, NextRequest } from 'next/server'
import { queryOne } from '@/lib/db/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await queryOne<{
    id: string; slug: string; title: string; content: string; excerpt: string | null
    cover_image: string | null; tags: string[]; created_at: string; updated_at: string
  }>(
    `SELECT id, slug, title, content, excerpt, cover_image, tags, created_at, updated_at
     FROM sebo.posts WHERE slug=$1 AND published=true`,
    [slug]
  )

  if (!post) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

  return NextResponse.json({
    id: post.id, slug: post.slug, title: post.title, content: post.content,
    excerpt: post.excerpt, coverImage: post.cover_image, tags: post.tags ?? [],
    createdAt: post.created_at, updatedAt: post.updated_at,
  })
}
