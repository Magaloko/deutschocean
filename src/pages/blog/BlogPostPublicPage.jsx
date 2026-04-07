import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { getPostBySlug } from '../../lib/blogData.js'
import styles from './BlogListPage.module.css'

const TYPE_META = {
  artikel: { label: 'Artikel', color: '#4f46e5' },
  studie:  { label: 'Studie',  color: '#10b981' },
  tipp:    { label: 'Tipp',    color: '#f59e0b' },
}

export default function BlogPostPublicPage() {
  const { slug } = useParams()
  const { profile } = useAuth()
  const [post, setPost]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPostBySlug(slug)
      .then(p => { setPost(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  // Logged-in users get the full version
  if (profile) return <Navigate to={`/app/blog/${slug}`} replace />

  if (loading) return <div className={styles.page}><p className={styles.empty}>Lade...</p></div>
  if (!post || !post.published) return <Navigate to="/blog" replace />

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt.toDate?.() ?? post.publishedAt).toLocaleDateString('de-AT')
    : ''
  const type = TYPE_META[post.contentType] ?? TYPE_META.artikel

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="10" fill="#4f46e5"/>
            <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
          </svg>
          <span>DeutschOcean</span>
        </Link>
        <Link to="/blog" className={styles.ctaLink}>← Blog</Link>
      </div>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title}
            style={{ width:'100%', borderRadius:'var(--radius-xl)', marginBottom:'1.5rem', maxHeight:360, objectFit:'cover' }} />
        )}

        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:'0.75rem', fontWeight:800, padding:'0.15rem 0.6rem', borderRadius:999, background:`${type.color}18`, color:type.color, border:`1px solid ${type.color}30` }}>{type.label}</span>
          {dateStr && <span style={{ fontSize:'0.75rem', color:'var(--text-light)' }}>{dateStr}</span>}
          {post.author && <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>✍️ {post.author}</span>}
        </div>

        <h1 style={{ fontSize:'clamp(1.6rem, 4vw, 2.2rem)', fontWeight:900, marginBottom:'0.75rem', fontFamily:'var(--font-display)', lineHeight:1.15 }}>{post.title}</h1>
        <p style={{ fontSize:'1.05rem', color:'var(--text-muted)', lineHeight:1.6, marginBottom:'2rem' }}>{post.excerpt}</p>

        {/* Login CTA */}
        <div style={{ background:'var(--hero-gradient)', borderRadius:'var(--radius-xl)', padding:'2rem', textAlign:'center', color:'#fff' }}>
          <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🔒</div>
          <h2 style={{ fontWeight:900, marginBottom:'0.5rem', fontFamily:'var(--font-display)' }}>Voller Artikel — nur für Mitglieder</h2>
          <p style={{ opacity:0.8, marginBottom:'1.25rem' }}>Melde dich an und lese alle Artikel kostenlos.</p>
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/registrieren" style={{ background:'#fbbf24', color:'#1e1b4b', fontWeight:800, padding:'0.75rem 1.5rem', borderRadius:'var(--radius-lg)', textDecoration:'none' }}>Kostenlos registrieren</Link>
            <Link to="/login" style={{ background:'rgba(255,255,255,.15)', color:'#fff', fontWeight:700, padding:'0.75rem 1.5rem', borderRadius:'var(--radius-lg)', textDecoration:'none', border:'1.5px solid rgba(255,255,255,.3)' }}>Anmelden</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
