import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { query, queryOne } from '@/lib/db/client'

export const revalidate = 3600

interface Post {
  id: string; slug: string; title: string; content: string
  excerpt: string | null; cover_image: string | null
  tags: string[]; created_at: string
}

export async function generateStaticParams() {
  const posts = await query<{ slug: string }>(
    'SELECT slug FROM sebo.posts WHERE published=true LIMIT 100'
  ).catch(() => [])
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await queryOne<Post>(
    'SELECT title, excerpt FROM sebo.posts WHERE slug=$1 AND published=true', [slug]
  ).catch(() => null)
  if (!post) return { title: 'Nicht gefunden' }
  return { title: `${post.title} — DeutschOcean Blog`, description: post.excerpt ?? undefined }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await queryOne<Post>(
    `SELECT id, slug, title, content, excerpt, cover_image, tags, created_at
     FROM sebo.posts WHERE slug=$1 AND published=true`, [slug]
  ).catch(() => null)

  if (!post) notFound()

  return (
    <main className="min-h-screen bg-white p-6">
      <article className="max-w-2xl mx-auto">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">← Alle Artikel</Link>

        <div className="flex gap-2 mb-4 flex-wrap">
          {(post.tags ?? []).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{t}</span>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <p className="text-sm text-gray-400 mb-8">
          {new Date(post.created_at).toLocaleDateString('de-DE', { day:'2-digit', month:'long', year:'numeric' })}
        </p>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="w-full rounded-2xl mb-6" />
        )}

        <div className="prose max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </main>
  )
}
