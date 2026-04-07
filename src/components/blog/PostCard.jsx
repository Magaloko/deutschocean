import React from 'react'
import { Link } from 'react-router-dom'
import styles from './PostCard.module.css'

const TYPE_META = {
  artikel: { label: 'Artikel', color: '#4f46e5' },
  studie:  { label: 'Studie',  color: '#10b981' },
  tipp:    { label: 'Tipp',    color: '#f59e0b' },
}
const AUDIENCE_LABEL = {
  eltern: '👨‍👩‍👧 Eltern',
  kinder: '🧒 Kinder',
  lehrer: '👩‍🏫 Lehrer',
  alle:   '🌍 Alle',
}

export default function PostCard({ post, href }) {
  const type = TYPE_META[post.contentType] ?? TYPE_META.artikel
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt.toDate?.() ?? post.publishedAt).toLocaleDateString('de-AT')
    : ''
  return (
    <Link to={href} className={styles.card}>
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className={styles.cover} loading="lazy" />
      )}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.typeBadge}
            style={{ background: `${type.color}18`, color: type.color, border: `1px solid ${type.color}30` }}>
            {type.label}
          </span>
          <span className={styles.audience}>
            {AUDIENCE_LABEL[post.audience] ?? '🌍 Alle'}
          </span>
        </div>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.footer}>
          {post.author && <span className={styles.author}>✍️ {post.author}</span>}
          {dateStr && <span className={styles.date}>{dateStr}</span>}
          <span className={styles.readMore}>Weiterlesen →</span>
        </div>
      </div>
    </Link>
  )
}
