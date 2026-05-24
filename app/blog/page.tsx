import Link from 'next/link'
import { query } from '@/lib/db/client'

// Cache 1h — SSG mit ISR
export const revalidate = 3600

interface Post {
  id: string; slug: string; title: string
  excerpt: string | null; cover_image: string | null
  tags: string[]; created_at: string
}

export default async function BlogPage() {
  const posts = await query<Post>(
    `SELECT id, slug, title, excerpt, cover_image, tags, created_at
     FROM sebo.posts WHERE published=true ORDER BY created_at DESC LIMIT 50`
  ).catch(() => [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Startseite</Link>
          <h1 className="text-4xl font-bold text-blue-900 mt-2">📖 DeutschOcean Blog</h1>
          <p className="text-gray-600 mt-2">Tipps für Eltern, Lehrer & Kinder</p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Noch keine Artikel veröffentlicht.
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map(p => (
              <Link key={p.id} href={`/blog/${p.slug}`}
                className="block bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md transition">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {(p.tags ?? []).map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{t}</span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h2>
                {p.excerpt && <p className="text-gray-600 text-sm">{p.excerpt}</p>}
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(p.created_at).toLocaleDateString('de-DE', { day:'2-digit', month:'long', year:'numeric' })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
