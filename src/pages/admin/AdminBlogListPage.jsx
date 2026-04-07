import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts, deletePost, publishPost, unpublishPost } from '../../lib/blogData.js'
import styles from './AdminBlogListPage.module.css'

export default function AdminBlogListPage() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(null)

  const load = () => {
    setLoading(true)
    getAllPosts().then(p => { setPosts(p); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(load, [])

  const handlePublish = async (id, published) => {
    setBusy(id)
    try {
      if (published) await unpublishPost(id)
      else           await publishPost(id)
      load()
    } finally { setBusy(null) }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Artikel "${title}" wirklich löschen?`)) return
    setBusy(id)
    try { await deletePost(id); load() }
    finally { setBusy(null) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Blog-Artikel</h1>
        <Link to="/admin/blog/neu" className={styles.newBtn}>+ Neuer Artikel</Link>
      </div>

      {loading && <p className={styles.empty}>Lade...</p>}
      {!loading && !posts.length && <p className={styles.empty}>Noch keine Artikel vorhanden.</p>}

      {!loading && posts.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Titel</th>
                <th>Typ</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => {
                const date = post.createdAt
                  ? new Date(post.createdAt.toDate?.() ?? post.createdAt).toLocaleDateString('de-AT')
                  : '—'
                return (
                  <tr key={post.id}>
                    <td className={styles.titleCell}>{post.title}</td>
                    <td><span className={styles.typeBadge}>{post.contentType}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${post.published ? styles.statusPublished : styles.statusDraft}`}>
                        {post.published ? 'Veröffentlicht' : 'Entwurf'}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{date}</td>
                    <td className={styles.actions}>
                      <Link to={`/admin/blog/${post.id}`} className={styles.editBtn}>Bearbeiten</Link>
                      <button
                        className={styles.publishBtn}
                        onClick={() => handlePublish(post.id, post.published)}
                        disabled={busy === post.id}>
                        {post.published ? 'Zurückziehen' : 'Veröffentlichen'}
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={busy === post.id}>
                        Löschen
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
