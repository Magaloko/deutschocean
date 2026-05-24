import Link from 'next/link'
import { query } from '@/lib/db/client'
import CreatePostButton from './CreatePostButton'

interface AdminPost {
  id: string; slug: string; title: string; published: boolean
  created_at: string; updated_at: string
}

export default async function AdminBlogList() {
  const posts = await query<AdminPost>(
    `SELECT id, slug, title, published, created_at, updated_at
     FROM sebo.posts ORDER BY updated_at DESC LIMIT 200`
  )

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-gray-500">{posts.length} Artikel</p>
        </div>
        <CreatePostButton />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Noch keine Artikel.</div>
        ) : posts.map(p => (
          <Link key={p.id} href={`/admin/blog/${p.id}`}
            className="block px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.title}</p>
                <p className="text-xs text-gray-400 mt-1">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-2 py-0.5 text-xs rounded-full ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(p.updated_at).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
