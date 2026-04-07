import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../../components/blog/PostCard.jsx'
import { getPublishedPosts } from '../../lib/blogData.js'
import styles from './BlogListPage.module.css'

const FILTERS = ['alle', 'artikel', 'studie', 'tipp']

export default function BlogListPage({ basePath = '/blog', showHeader = true }) {
  const [posts, setPosts]     = useState([])
  const [filter, setFilter]   = useState('alle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishedPosts().then(p => { setPosts(p); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'alle' ? posts : posts.filter(p => p.contentType === filter)

  return (
    <div className={styles.page}>
      {showHeader && (
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#4f46e5"/>
              <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
            </svg>
            <span>DeutschOcean</span>
          </Link>
          <Link to="/start" className={styles.ctaLink}>App öffnen →</Link>
        </div>
      )}

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>📚 Wissensdatenbank</h1>
        <p className={styles.heroSub}>Artikel, Studien und Tipps rund ums Lernen</p>
      </div>

      <div className={styles.inner}>
        <div className={styles.filterBar}>
          {FILTERS.map(f => (
            <button key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p className={styles.empty}>Lade Artikel...</p>}
        {!loading && !filtered.length && <p className={styles.empty}>Noch keine Artikel vorhanden.</p>}

        <div className={styles.grid}>
          {filtered.map(post => (
            <PostCard key={post.id} post={post} href={`${basePath}/${post.slug}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
