import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TipTapEditor from '../../components/editor/TipTapEditor.jsx'
import { getPostById, createPost, updatePost, publishPost, generateSlug } from '../../lib/blogData.js'
import styles from './BlogEditorPage.module.css'

const EMPTY = {
  title: '', slug: '', excerpt: '', contentType: 'artikel', audience: 'alle',
  tags: '', coverImage: '', author: '', content: '',
  sourceUrl: '', sourceAuthor: '', sourceYear: '',
}

export default function BlogEditorPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isNew     = !id || id === 'neu'

  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  useEffect(() => {
    if (!isNew) {
      getPostById(id).then(post => {
        if (post) setForm({
          title:       post.title        ?? '',
          slug:        post.slug         ?? '',
          excerpt:     post.excerpt      ?? '',
          contentType: post.contentType  ?? 'artikel',
          audience:    post.audience     ?? 'alle',
          tags:        (post.tags ?? []).join(', '),
          coverImage:  post.coverImage   ?? '',
          author:      post.author       ?? '',
          content:     post.content      ?? '',
          sourceUrl:   post.sourceUrl    ?? '',
          sourceAuthor:post.sourceAuthor ?? '',
          sourceYear:  post.sourceYear   ?? '',
        })
      })
    }
  }, [id, isNew])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleTitleChange = (val) => {
    set('title', val)
    if (isNew) set('slug', generateSlug(val))
  }

  const tagsArray = () => form.tags.split(',').map(t => t.trim()).filter(Boolean)

  const save = async (publish = false) => {
    if (!form.title) { setMsg('Titel ist erforderlich.'); return }
    setSaving(true); setMsg('')
    try {
      const data = {
        title:       form.title,
        slug:        form.slug || generateSlug(form.title),
        excerpt:     form.excerpt,
        contentType: form.contentType,
        audience:    form.audience,
        tags:        tagsArray(),
        coverImage:  form.coverImage || null,
        author:      form.author,
        content:     form.content || '',
        sourceUrl:   form.contentType === 'studie' ? form.sourceUrl   || null : null,
        sourceAuthor:form.contentType === 'studie' ? form.sourceAuthor|| null : null,
        sourceYear:  form.contentType === 'studie' ? Number(form.sourceYear) || null : null,
      }
      let docId = id
      if (isNew) {
        const ref = await createPost(data)
        docId = ref.id
      } else {
        await updatePost(id, data)
      }
      if (publish) await publishPost(docId)
      setMsg(publish ? 'Veröffentlicht!' : 'Gespeichert.')
      setTimeout(() => navigate('/admin/blog'), 1200)
    } catch (e) {
      setMsg('Fehler: ' + e.message)
    } finally { setSaving(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>{isNew ? 'Neuer Artikel' : 'Artikel bearbeiten'}</h1>
        <div className={styles.topActions}>
          {!isNew && (
            <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer" className={styles.previewBtn}>
              Vorschau ↗
            </a>
          )}
          <button className={styles.draftBtn} onClick={() => save(false)} disabled={saving}>
            {saving ? '...' : 'Als Entwurf speichern'}
          </button>
          <button className={styles.publishBtn} onClick={() => save(true)} disabled={saving}>
            {saving ? '...' : 'Veröffentlichen'}
          </button>
        </div>
      </div>

      {msg && <div className={styles.msg}>{msg}</div>}

      <div className={styles.layout}>
        {/* Main: Editor */}
        <div className={styles.editorCol}>
          <TipTapEditor value={form.content} onChange={val => set('content', val)} />
        </div>

        {/* Sidebar: meta fields */}
        <aside className={styles.sidebar}>
          <div className={styles.field}>
            <label className={styles.label}>Titel *</label>
            <input className={styles.input} value={form.title}
              onChange={e => handleTitleChange(e.target.value)} placeholder="Artikel-Titel" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Slug (URL)</label>
            <input className={styles.input} value={form.slug}
              onChange={e => set('slug', e.target.value)} placeholder="mein-artikel-titel" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Excerpt (max. 200 Zeichen)</label>
            <textarea className={styles.textarea} rows={3} maxLength={200}
              value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
              placeholder="Kurzbeschreibung..." />
            <span className={styles.counter}>{form.excerpt.length}/200</span>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Typ</label>
              <select className={styles.select} value={form.contentType}
                onChange={e => set('contentType', e.target.value)}>
                <option value="artikel">Artikel</option>
                <option value="studie">Studie</option>
                <option value="tipp">Tipp</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Zielgruppe</label>
              <select className={styles.select} value={form.audience}
                onChange={e => set('audience', e.target.value)}>
                <option value="alle">Alle</option>
                <option value="eltern">Eltern</option>
                <option value="kinder">Kinder</option>
                <option value="lehrer">Lehrer</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tags (kommagetrennt)</label>
            <input className={styles.input} value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="grammatik, lesen, mathe" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Cover-Bild URL (optional)</label>
            <input className={styles.input} value={form.coverImage}
              onChange={e => set('coverImage', e.target.value)} placeholder="https://..." />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Autor</label>
            <input className={styles.input} value={form.author}
              onChange={e => set('author', e.target.value)} placeholder="Name des Autors" />
          </div>

          {form.contentType === 'studie' && (
            <div className={styles.studieBox}>
              <div className={styles.studieTitle}>Quellen (Studie)</div>
              <div className={styles.field}>
                <label className={styles.label}>Quellen-URL</label>
                <input className={styles.input} value={form.sourceUrl}
                  onChange={e => set('sourceUrl', e.target.value)} placeholder="https://..." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Autor(en)</label>
                <input className={styles.input} value={form.sourceAuthor}
                  onChange={e => set('sourceAuthor', e.target.value)} placeholder="Smith, J. et al." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Jahr</label>
                <input className={styles.input} type="number" value={form.sourceYear}
                  onChange={e => set('sourceYear', e.target.value)} placeholder="2024" />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
