import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { getPostBySlug, getPublishedPosts } from '../../lib/blogData.js'
import PostContent from '../../components/blog/PostContent.jsx'
import PostCard from '../../components/blog/PostCard.jsx'
import styles from './BlogPostPage.module.css'

const TYPE_META = {
  artikel: { label: 'Artikel', color: '#4f46e5' },
  studie:  { label: 'Studie',  color: '#10b981' },
  tipp:    { label: 'Tipp',    color: '#f59e0b' },
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost]       = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPostBySlug(slug)
      .then(async p => {
        setPost(p)
        if (p?.tags?.length) {
          const all = await getPublishedPosts(50)
          const rel = all
            .filter(r => r.id !== p.id && r.tags?.some(t => p.tags.includes(t)))
            .slice(0, 3)
          setRelated(rel)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className={styles.page}><p className={styles.empty}>Lade...</p></div>
  if (!post || !post.published) return <Navigate to="/app/blog" replace />

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt.toDate?.() ?? post.publishedAt).toLocaleDateString('de-AT')
    : ''
  const type = TYPE_META[post.contentType] ?? TYPE_META.artikel

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link to="/app/blog" className={styles.back}>← Zurück zum Blog</Link>

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className={styles.cover} />
        )}

        <div className={styles.metaRow}>
          <span className={styles.typeBadge}
            style={{ background:`${type.color}18`, color:type.color, border:`1px solid ${type.color}30` }}>
            {type.label}
          </span>
          {dateStr && <span className={styles.date}>{dateStr}</span>}
          {post.author && <span className={styles.author}>✍️ {post.author}</span>}
          {post.tags?.map(t => (
            <span key={t} className={styles.tag}>#{t}</span>
          ))}
        </div>

        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.excerpt}>{post.excerpt}</p>

        <PostContent content={post.content} />

        {post.contentType === 'studie' && (post.sourceAuthor || post.sourceUrl) && (
          <div className={styles.sourceBox}>
            <strong>📖 Quelle:</strong>{' '}
            {post.sourceAuthor && <span>{post.sourceAuthor}</span>}
            {post.sourceYear && <span> ({post.sourceYear})</span>}
            {post.sourceUrl && (
              <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                {' '}→ Zur Studie
              </a>
            )}
          </div>
        )}

        {related.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Verwandte Artikel</h2>
            <div className={styles.relatedGrid}>
              {related.map(r => (
                <PostCard key={r.id} post={r} href={`/app/blog/${r.slug}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
