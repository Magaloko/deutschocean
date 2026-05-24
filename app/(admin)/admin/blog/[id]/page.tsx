import { notFound } from 'next/navigation'
import { queryOne } from '@/lib/db/client'
import BlogEditor from './BlogEditor'

export default async function AdminBlogEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await queryOne<{
    id: string; slug: string; title: string; content: string
    excerpt: string | null; cover_image: string | null
    tags: string[]; published: boolean
  }>(
    `SELECT id, slug, title, content, excerpt, cover_image, tags, published
     FROM sebo.posts WHERE id=$1`, [id]
  )

  if (!post) notFound()

  return (
    <BlogEditor
      id={post.id}
      initialSlug={post.slug}
      initialTitle={post.title}
      initialContent={post.content}
      initialExcerpt={post.excerpt ?? ''}
      initialCover={post.cover_image ?? ''}
      initialTags={(post.tags ?? []).join(', ')}
      initialPublished={post.published}
    />
  )
}
