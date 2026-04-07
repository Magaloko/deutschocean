# Blog / Wissensdatenbank Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Öffentlicher Blog mit Admin-Panel (TipTap-Editor), Firestore-Backend und automatischen Artikel-Empfehlungen im Dashboard.

**Architecture:** Alle Artikel in Firestore `posts/{id}`. Öffentliche Routen `/blog` und `/blog/:slug` zeigen Vorschau; volle Inhalte nur eingeloggt unter `/app/blog/:slug`. Admin-Panel unter `/admin` mit TipTap-Block-Editor, geschützt durch `isAdmin: true` im Firestore-User-Dokument. Tag-basiertes Empfehlungssystem im Dashboard ohne KI-Backend.

**Tech Stack:** React + Vite + Firebase Firestore + TipTap v2 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`)

---

## Datei-Übersicht

| Datei | Aktion | Zweck |
|-------|--------|-------|
| `src/lib/blogData.js` | NEU | Firestore CRUD + slug-Generator |
| `src/hooks/useRecommendedPosts.js` | NEU | Tag-Matching-Hook für Dashboard |
| `src/components/blog/PostCard.jsx` | NEU | Vorschau-Karte (Titel, Excerpt, Badges) |
| `src/components/blog/PostCard.module.css` | NEU | Styles für PostCard |
| `src/components/blog/PostContent.jsx` | NEU | TipTap-JSON → read-only Editor |
| `src/components/blog/PostContent.module.css` | NEU | Typografie für Artikel-Content |
| `src/components/editor/TipTapEditor.jsx` | NEU | TipTap-Editor-Wrapper mit Toolbar |
| `src/components/editor/TipTapEditor.module.css` | NEU | Editor-Styles |
| `src/pages/blog/BlogListPage.jsx` | NEU | Blog-Liste (public + eingeloggt via prop) |
| `src/pages/blog/BlogListPage.module.css` | NEU | |
| `src/pages/blog/BlogPostPublicPage.jsx` | NEU | Öffentlicher Post mit Login-CTA |
| `src/pages/blog/BlogPostPage.jsx` | NEU | Voller Post (eingeloggt) |
| `src/pages/blog/BlogPostPage.module.css` | NEU | |
| `src/pages/admin/AdminLayout.jsx` | NEU | isAdmin Guard + Sidebar |
| `src/pages/admin/AdminLayout.module.css` | NEU | |
| `src/pages/admin/AdminBlogListPage.jsx` | NEU | Post-Liste mit Publish/Delete |
| `src/pages/admin/AdminBlogListPage.module.css` | NEU | |
| `src/pages/admin/BlogEditorPage.jsx` | NEU | Formular + TipTap-Editor |
| `src/pages/admin/BlogEditorPage.module.css` | NEU | |
| `src/App.jsx` | UPDATE | Neue Routen hinzufügen |
| `src/pages/LandingPage.jsx` | UPDATE | Blog-Link + "Aus unserem Blog" Sektion |
| `src/pages/LandingPage.module.css` | UPDATE | Styles für Blog-Sektion |
| `src/components/layout/NavBar.jsx` | UPDATE | Blog-Link für eingeloggte User |
| `src/pages/app/DashboardPage.jsx` | UPDATE | "Für dich empfohlen" Sektion |
| `src/pages/app/DashboardPage.module.css` | UPDATE | Styles für Empfehlungen |

---

### Task 1: TipTap Dependencies installieren

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Dependencies installieren**

```bash
cd C:\Users\Mago\Dev\active\deutschocean
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

Expected output: `added N packages` ohne Fehler.

- [ ] **Step 2: Verify**

```bash
node -e "require('./node_modules/@tiptap/react/package.json'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add TipTap dependencies"
```

---

### Task 2: Firestore Data Layer

**Files:**
- Create: `src/lib/blogData.js`

- [ ] **Step 1: Erstelle `src/lib/blogData.js`**

```js
import { db } from './firebase.js'
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore'

export async function getPublishedPosts(limitCount = 50) {
  if (!db) return []
  const q = query(
    collection(db, 'posts'),
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getLatestPosts(limitCount = 3) {
  return getPublishedPosts(limitCount)
}

export async function getAllPosts() {
  if (!db) return []
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getPostBySlug(slug) {
  if (!db) return null
  const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function getPostById(id) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'posts', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function createPost(data) {
  if (!db) throw new Error('Firebase not configured')
  const now = serverTimestamp()
  return addDoc(collection(db, 'posts'), {
    ...data,
    published: false,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updatePost(id, data) {
  if (!db) throw new Error('Firebase not configured')
  return updateDoc(doc(db, 'posts', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deletePost(id) {
  if (!db) throw new Error('Firebase not configured')
  return deleteDoc(doc(db, 'posts', id))
}

export async function publishPost(id) {
  if (!db) throw new Error('Firebase not configured')
  return updateDoc(doc(db, 'posts', id), {
    published: true,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function unpublishPost(id) {
  if (!db) throw new Error('Firebase not configured')
  return updateDoc(doc(db, 'posts', id), {
    published: false,
    updatedAt: serverTimestamp(),
  })
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `built in` ohne Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/lib/blogData.js
git commit -m "feat: blogData Firestore CRUD layer"
```

---

### Task 3: useRecommendedPosts Hook

**Files:**
- Create: `src/hooks/useRecommendedPosts.js`

- [ ] **Step 1: Erstelle `src/hooks/useRecommendedPosts.js`**

```js
import { useState, useEffect } from 'react'
import { getPublishedPosts } from '../lib/blogData.js'

// Game-type → tags Mapping
const GAME_TAG_MAP = {
  fehlerDetektiv:       ['grammatik', 'rechtschreibung'],
  personenbeschreibung: ['schreiben', 'wortschatz'],
  diktat:               ['rechtschreibung', 'schreiben'],
  silbenPuzzle:         ['lesen', 'wortschatz'],
  buchstabenChaos:      ['lesen', 'buchstaben'],
  nomenFinder:          ['grammatik', 'nomen'],
  satzBuilder:          ['grammatik', 'schreiben'],
  farbenJaeger:         ['wortschatz', 'farben'],
  tierGeraeusche:       ['wortschatz', 'tiere'],
  memorySpiel:          ['gedächtnis', 'wortschatz'],
  wasFehlt:             ['konzentration', 'wortschatz'],
  falscherGegenstand:   ['konzentration', 'logik'],
  emotionenSpiel:       ['emotionen', 'sozial'],
  fahrzeugLenker:       ['wortschatz', 'fahrzeuge'],
  tierWissen:           ['wortschatz', 'tiere'],
  emojiGeschichte:      ['kreativität', 'schreiben'],
  emojiBaukasten:       ['kreativität', 'wortschatz'],
  emotionenKarten:      ['emotionen', 'sozial'],
  fruechtZaehlen:       ['mathe', 'zählen'],
  zahlenstrahl:         ['mathe', 'zahlen'],
  mehrWeniger:          ['mathe', 'vergleichen'],
  minusRakete:          ['mathe', 'rechnen'],
  zahlenfolge:          ['mathe', 'logik'],
  wuerfelRechnen:       ['mathe', 'rechnen'],
  miniMarkt:            ['mathe', 'alltag'],
  einmaleinsBlitz:      ['mathe', 'einmaleins'],
}

function scorePost(post, userTags, userAudiences) {
  let score = 0
  if (!userAudiences.includes(post.audience)) return -1
  const postTags = post.tags ?? []
  for (const tag of userTags) {
    if (postTags.includes(tag)) score += 2
  }
  return score
}

export function useRecommendedPosts(profile) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!profile) return
    getPublishedPosts(50).then(allPosts => {
      if (!allPosts.length) return

      // Build user tag interests from completed missions
      const completed = profile.completedMissions ?? []
      const userTags = [...new Set(
        completed.flatMap(missionId => {
          const type = missionId.split('-')[0]
          return GAME_TAG_MAP[type] ?? []
        })
      )]

      // If no history, use onboarding tags
      const effectiveTags = userTags.length ? userTags : ['anfänger', 'onboarding', 'eltern']

      // Audiences: always include 'alle', plus role-specific
      const userAudiences = ['alle', profile.schoolModule === 'kindergarten' ? 'kinder' : 'kinder', 'eltern']

      const scored = allPosts
        .map(p => ({ post: p, score: scorePost(p, effectiveTags, userAudiences) }))
        .filter(({ score }) => score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(({ post }) => post)

      setPosts(scored)
    }).catch(() => {})
  }, [profile?.uid, JSON.stringify(profile?.completedMissions)])

  return posts
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRecommendedPosts.js
git commit -m "feat: useRecommendedPosts tag-matching hook"
```

---

### Task 4: PostCard Komponente

**Files:**
- Create: `src/components/blog/PostCard.jsx`
- Create: `src/components/blog/PostCard.module.css`

- [ ] **Step 1: Erstelle `src/components/blog/PostCard.jsx`**

```jsx
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
```

- [ ] **Step 2: Erstelle `src/components/blog/PostCard.module.css`**

```css
.card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: var(--border-1) solid var(--border);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }

.cover { width: 100%; height: 180px; object-fit: cover; }

.body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; flex: 1; }

.meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.typeBadge {
  font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.6rem;
  border-radius: 999px; letter-spacing: 0.03em;
}
.audience { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }

.title { font-size: 1rem; font-weight: 800; line-height: 1.3; font-family: var(--font-display); margin: 0; }
.excerpt { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin: 0; flex: 1; }

.footer {
  display: flex; align-items: center; gap: 0.75rem;
  flex-wrap: wrap; margin-top: auto; padding-top: 0.5rem;
  border-top: var(--border-1) solid var(--border);
}
.author { font-size: 0.75rem; color: var(--text-muted); }
.date   { font-size: 0.75rem; color: var(--text-light); margin-left: auto; }
.readMore { font-size: 0.78rem; font-weight: 700; color: var(--primary); margin-left: auto; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/PostCard.jsx src/components/blog/PostCard.module.css
git commit -m "feat: PostCard blog preview component"
```

---

### Task 5: PostContent Komponente (TipTap Read-Only Renderer)

**Files:**
- Create: `src/components/blog/PostContent.jsx`
- Create: `src/components/blog/PostContent.module.css`

- [ ] **Step 1: Erstelle `src/components/blog/PostContent.jsx`**

```jsx
import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import styles from './PostContent.module.css'

export default function PostContent({ content }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: true, autolink: true })],
    content: content ?? '',
    editable: false,
  })
  if (!content) return null
  return <EditorContent editor={editor} className={styles.content} />
}
```

- [ ] **Step 2: Erstelle `src/components/blog/PostContent.module.css`**

```css
.content {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--text);
}
.content :global(h1) { font-size: 1.8rem; font-weight: 900; margin: 1.5rem 0 0.5rem; font-family: var(--font-display); }
.content :global(h2) { font-size: 1.4rem; font-weight: 800; margin: 1.25rem 0 0.5rem; font-family: var(--font-display); }
.content :global(h3) { font-size: 1.15rem; font-weight: 700; margin: 1rem 0 0.4rem; font-family: var(--font-display); }
.content :global(p)  { margin: 0 0 1rem; }
.content :global(strong) { font-weight: 700; }
.content :global(em) { font-style: italic; }
.content :global(blockquote) {
  border-left: 4px solid var(--primary); padding: 0.5rem 1rem;
  margin: 1rem 0; background: var(--surface-2); border-radius: 0 var(--radius) var(--radius) 0;
  color: var(--text-muted);
}
.content :global(code) {
  background: var(--surface-2); padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm); font-size: 0.88em; font-family: monospace;
}
.content :global(pre) {
  background: #1e1b4b; color: #e0e7ff; padding: 1rem 1.25rem;
  border-radius: var(--radius); overflow-x: auto; margin: 1rem 0;
}
.content :global(pre code) { background: none; color: inherit; padding: 0; }
.content :global(ul), .content :global(ol) { padding-left: 1.5rem; margin: 0 0 1rem; }
.content :global(li) { margin-bottom: 0.25rem; }
.content :global(img) { max-width: 100%; border-radius: var(--radius); margin: 1rem 0; }
.content :global(a) { color: var(--primary); text-decoration: underline; }
.content :global(hr) { border: none; border-top: 2px solid var(--border); margin: 1.5rem 0; }
.content :global(.ProseMirror) { outline: none; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/PostContent.jsx src/components/blog/PostContent.module.css
git commit -m "feat: PostContent read-only TipTap renderer"
```

---

### Task 6: TipTapEditor Komponente

**Files:**
- Create: `src/components/editor/TipTapEditor.jsx`
- Create: `src/components/editor/TipTapEditor.module.css`

- [ ] **Step 1: Erstelle `src/components/editor/TipTapEditor.jsx`**

```jsx
import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import styles from './TipTapEditor.module.css'

function ToolbarButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ''}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

export default function TipTapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Artikel-Inhalt hier schreiben...' }),
    ],
    content: value ?? '',
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Bild-URL eingeben:')
    if (url && editor) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addLink = useCallback(() => {
    const url = window.prompt('Link-URL eingeben:')
    if (url && editor) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Fett">B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Kursiv"><em>I</em></ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Überschrift 1">H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Überschrift 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Überschrift 3">H3</ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Zitat">❝</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')} title="Code">{`<>`}</ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Aufzählung">• —</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Nummerierung">1.</ToolbarButton>
        <div className={styles.sep} />
        <ToolbarButton onClick={addImage} title="Bild">🖼</ToolbarButton>
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Link">🔗</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Trennlinie">—</ToolbarButton>
      </div>
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  )
}
```

- [ ] **Step 2: Erstelle `src/components/editor/TipTapEditor.module.css`**

```css
.wrap {
  border: var(--border-2) solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}
.wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.15); }

.toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--surface-2);
  border-bottom: var(--border-1) solid var(--border);
  flex-wrap: wrap;
}
.toolBtn {
  padding: 4px 8px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  color: var(--text-muted);
  transition: background 0.12s, color 0.12s;
  min-width: 28px;
}
.toolBtn:hover { background: var(--border); color: var(--text); }
.toolBtnActive { background: rgba(79,70,229,.12); color: var(--primary); }
.sep { width: 1px; height: 20px; background: var(--border); margin: 0 2px; }

.editor { padding: 1rem 1.25rem; min-height: 300px; }
.editor :global(.ProseMirror) { outline: none; min-height: 280px; }
.editor :global(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--text-light);
  pointer-events: none;
  float: left;
  height: 0;
}
.editor :global(h1) { font-size: 1.6rem; font-weight: 900; margin: 1rem 0 0.4rem; font-family: var(--font-display); }
.editor :global(h2) { font-size: 1.3rem; font-weight: 800; margin: 0.8rem 0 0.3rem; font-family: var(--font-display); }
.editor :global(h3) { font-size: 1.1rem; font-weight: 700; margin: 0.6rem 0 0.3rem; font-family: var(--font-display); }
.editor :global(blockquote) {
  border-left: 3px solid var(--primary); padding: 0.3rem 0.75rem;
  margin: 0.75rem 0; background: var(--surface-2); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
.editor :global(code) {
  background: var(--surface-2); padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm); font-size: 0.85em; font-family: monospace;
}
.editor :global(ul), .editor :global(ol) { padding-left: 1.5rem; }
.editor :global(img) { max-width: 100%; border-radius: var(--radius); }
.editor :global(hr) { border: none; border-top: 2px solid var(--border); margin: 1rem 0; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/TipTapEditor.jsx src/components/editor/TipTapEditor.module.css
git commit -m "feat: TipTap block editor component with toolbar"
```

---

### Task 7: BlogListPage (öffentlich + eingeloggt)

**Files:**
- Create: `src/pages/blog/BlogListPage.jsx`
- Create: `src/pages/blog/BlogListPage.module.css`

- [ ] **Step 1: Erstelle `src/pages/blog/BlogListPage.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../../components/blog/PostCard.jsx'
import { getPublishedPosts } from '../../lib/blogData.js'
import styles from './BlogListPage.module.css'

const FILTERS = ['alle', 'artikel', 'studie', 'tipp']

// basePath: '/blog' für public, '/app/blog' für eingeloggt
export default function BlogListPage({ basePath = '/blog', showHeader = true }) {
  const [posts, setPosts]   = useState([])
  const [filter, setFilter] = useState('alle')
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
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
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
```

- [ ] **Step 2: Erstelle `src/pages/blog/BlogListPage.module.css`**

```css
.page { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }

.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 2rem;
  background: rgba(30,27,75,.95); backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 50;
}
.logo { display: flex; align-items: center; gap: 0.6rem; font-weight: 800; font-size: 1.1rem; color: #fff; text-decoration: none; font-family: var(--font-display); }
.ctaLink { font-size: 0.88rem; font-weight: 700; color: rgba(255,255,255,.8); text-decoration: none; }
.ctaLink:hover { color: #fff; }

.hero {
  background: var(--hero-gradient);
  padding: 3rem 2rem 2.5rem;
  text-align: center;
  color: #fff;
}
.heroTitle { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 900; margin: 0 0 0.5rem; font-family: var(--font-display); }
.heroSub   { font-size: 1rem; opacity: 0.8; margin: 0; }

.inner { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; width: 100%; }

.filterBar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filterBtn {
  padding: 0.4rem 1rem; border-radius: 999px; border: var(--border-2) solid var(--border);
  background: var(--surface); font-size: 0.85rem; font-weight: 700; font-family: inherit;
  cursor: pointer; color: var(--text-muted); transition: all .15s;
}
.filterBtn:hover { border-color: var(--primary); color: var(--primary); }
.filterActive { background: var(--primary); border-color: var(--primary); color: #fff !important; }

.empty { text-align: center; color: var(--text-muted); padding: 3rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .header { padding: 0.75rem 1rem; }
  .inner  { padding: 1.25rem 1rem; }
  .grid   { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/BlogListPage.jsx src/pages/blog/BlogListPage.module.css
git commit -m "feat: BlogListPage with filter bar"
```

---

### Task 8: BlogPostPublicPage (öffentlich, mit Login-CTA)

**Files:**
- Create: `src/pages/blog/BlogPostPublicPage.jsx`

- [ ] **Step 1: Erstelle `src/pages/blog/BlogPostPublicPage.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { getPostBySlug } from '../../lib/blogData.js'
import PostContent from '../../components/blog/PostContent.jsx'
import styles from './BlogListPage.module.css'

export default function BlogPostPublicPage() {
  const { slug } = useParams()
  const { profile } = useAuth()
  const [post, setPost]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Logged-in users get the full version
  if (profile) return <Navigate to={`/app/blog/${slug}`} replace />

  useEffect(() => {
    getPostBySlug(slug)
      .then(p => { setPost(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className={styles.page}><p className={styles.empty}>Lade...</p></div>
  if (!post || !post.published) return <Navigate to="/blog" replace />

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt.toDate?.() ?? post.publishedAt).toLocaleDateString('de-AT')
    : ''

  const TYPE_META = { artikel: { label: 'Artikel', color: '#4f46e5' }, studie: { label: 'Studie', color: '#10b981' }, tipp: { label: 'Tipp', color: '#f59e0b' } }
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
        {post.coverImage && <img src={post.coverImage} alt={post.title} style={{ width:'100%', borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem', maxHeight: 360, objectFit: 'cover' }} />}

        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.75rem', fontWeight:800, padding:'0.15rem 0.6rem', borderRadius:999, background:`${type.color}18`, color: type.color }}>{type.label}</span>
          {dateStr && <span style={{ fontSize:'0.75rem', color:'var(--text-light)' }}>{dateStr}</span>}
          {post.author && <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>✍️ {post.author}</span>}
        </div>

        <h1 style={{ fontSize:'clamp(1.6rem, 4vw, 2.2rem)', fontWeight:900, marginBottom:'0.75rem', fontFamily:'var(--font-display)' }}>{post.title}</h1>
        <p style={{ fontSize:'1.05rem', color:'var(--text-muted)', lineHeight:1.6, marginBottom:'1.5rem' }}>{post.excerpt}</p>

        {/* Teaser: first part of content */}
        <PostContent content={post.content} />

        {/* Login CTA */}
        <div style={{ background:'var(--hero-gradient)', borderRadius:'var(--radius-xl)', padding:'2rem', textAlign:'center', color:'#fff', marginTop:'2rem' }}>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/blog/BlogPostPublicPage.jsx
git commit -m "feat: BlogPostPublicPage with login CTA"
```

---

### Task 9: BlogPostPage (eingeloggt, voller Content)

**Files:**
- Create: `src/pages/blog/BlogPostPage.jsx`
- Create: `src/pages/blog/BlogPostPage.module.css`

- [ ] **Step 1: Erstelle `src/pages/blog/BlogPostPage.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { getPostBySlug } from '../../lib/blogData.js'
import PostContent from '../../components/blog/PostContent.jsx'
import PostCard from '../../components/blog/PostCard.jsx'
import styles from './BlogPostPage.module.css'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost]     = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPostBySlug(slug)
      .then(p => { setPost(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className={styles.page}><p className={styles.empty}>Lade...</p></div>
  if (!post || !post.published) return <Navigate to="/app/blog" replace />

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt.toDate?.() ?? post.publishedAt).toLocaleDateString('de-AT')
    : ''

  const TYPE_META = { artikel: { label: 'Artikel', color: '#4f46e5' }, studie: { label: 'Studie', color: '#10b981' }, tipp: { label: 'Tipp', color: '#f59e0b' } }
  const type = TYPE_META[post.contentType] ?? TYPE_META.artikel

  return (
    <div className={styles.page}>
      <Link to="/app/blog" className={styles.backBtn}>← Zurück zum Blog</Link>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className={styles.cover} />
      )}

      <div className={styles.meta}>
        <span className={styles.typeBadge} style={{ background:`${type.color}18`, color: type.color }}>{type.label}</span>
        {dateStr && <span className={styles.date}>{dateStr}</span>}
        {post.author && <span className={styles.author}>✍️ {post.author}</span>}
      </div>

      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.excerpt}>{post.excerpt}</p>

      {post.tags?.length > 0 && (
        <div className={styles.tags}>
          {post.tags.map(tag => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.contentWrap}>
        <PostContent content={post.content} />
      </div>

      {/* Studien-Quelle */}
      {post.contentType === 'studie' && post.sourceUrl && (
        <div className={styles.sourceBox}>
          <strong>Quelle:</strong> {post.sourceAuthor} ({post.sourceYear}) —{' '}
          <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer">{post.sourceUrl}</a>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Erstelle `src/pages/blog/BlogPostPage.module.css`**

```css
.page { max-width: 740px; margin: 0 auto; padding: 0 0 3rem; }
.backBtn { display: inline-block; color: var(--text-muted); font-size: 0.88rem; font-weight: 700; margin-bottom: 1.5rem; text-decoration: none; }
.backBtn:hover { color: var(--primary); }
.cover { width: 100%; max-height: 360px; object-fit: cover; border-radius: var(--radius-xl); margin-bottom: 1.5rem; }
.meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.typeBadge { font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.6rem; border-radius: 999px; }
.date, .author { font-size: 0.78rem; color: var(--text-muted); }
.title { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; line-height: 1.15; margin: 0 0 0.75rem; font-family: var(--font-display); }
.excerpt { font-size: 1.05rem; color: var(--text-muted); line-height: 1.6; margin: 0 0 1.25rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem; }
.tag { font-size: 0.75rem; font-weight: 700; color: var(--primary); background: rgba(79,70,229,.08); padding: 0.15rem 0.6rem; border-radius: 999px; }
.contentWrap { margin: 1.5rem 0; }
.sourceBox { background: var(--surface-2); border-left: 4px solid var(--accent-green); padding: 1rem 1.25rem; border-radius: 0 var(--radius) var(--radius) 0; font-size: 0.88rem; color: var(--text-muted); margin-top: 2rem; }
.sourceBox a { color: var(--primary); }
.empty { text-align: center; padding: 3rem; color: var(--text-muted); }
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/BlogPostPage.jsx src/pages/blog/BlogPostPage.module.css
git commit -m "feat: BlogPostPage full article view"
```

---

### Task 10: AdminLayout (isAdmin Guard)

**Files:**
- Create: `src/pages/admin/AdminLayout.jsx`
- Create: `src/pages/admin/AdminLayout.module.css`

- [ ] **Step 1: Erstelle `src/pages/admin/AdminLayout.jsx`**

```jsx
import React from 'react'
import { Outlet, Navigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { profile, loading } = useAuth()

  if (loading) return <div className={styles.loading}>Lade...</div>
  if (!profile || !profile.isAdmin) return <Navigate to="/app" replace />

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>⚙️ Admin</div>
        <nav className={styles.sidebarNav}>
          <NavLink to="/admin/blog"
            className={({ isActive }) => isActive ? styles.sidebarLinkActive : styles.sidebarLink}>
            📝 Blog-Artikel
          </NavLink>
        </nav>
        <NavLink to="/app" className={styles.sidebarBack}>← Zurück zur App</NavLink>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Erstelle `src/pages/admin/AdminLayout.module.css`**

```css
.layout { display: flex; min-height: 100vh; }
.loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }

.sidebar {
  width: 220px; flex-shrink: 0;
  background: #1e1b4b; color: #fff;
  display: flex; flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky; top: 0; height: 100vh;
}
.sidebarLogo { font-size: 1.1rem; font-weight: 900; margin-bottom: 2rem; padding: 0 0.5rem; font-family: var(--font-display); }

.sidebarNav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.sidebarLink, .sidebarLinkActive {
  display: block; padding: 0.6rem 0.75rem; border-radius: var(--radius);
  font-size: 0.88rem; font-weight: 700; text-decoration: none; color: rgba(255,255,255,.7);
  transition: background 0.12s, color 0.12s;
}
.sidebarLink:hover { background: rgba(255,255,255,.1); color: #fff; }
.sidebarLinkActive { background: rgba(79,70,229,.5); color: #fff; }

.sidebarBack { font-size: 0.8rem; color: rgba(255,255,255,.5); text-decoration: none; padding: 0.5rem; }
.sidebarBack:hover { color: rgba(255,255,255,.8); }

.main { flex: 1; padding: 2rem; background: var(--bg); min-height: 100vh; overflow-y: auto; }

@media (max-width: 640px) {
  .sidebar { display: none; }
  .main { padding: 1rem; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminLayout.jsx src/pages/admin/AdminLayout.module.css
git commit -m "feat: AdminLayout with isAdmin guard"
```

---

### Task 11: AdminBlogListPage

**Files:**
- Create: `src/pages/admin/AdminBlogListPage.jsx`
- Create: `src/pages/admin/AdminBlogListPage.module.css`

- [ ] **Step 1: Erstelle `src/pages/admin/AdminBlogListPage.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts, deletePost, publishPost, unpublishPost } from '../../lib/blogData.js'
import styles from './AdminBlogListPage.module.css'

export default function AdminBlogListPage() {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]     = useState(null)

  const reload = () => getAllPosts().then(p => { setPosts(p); setLoading(false) })
  useEffect(() => { reload() }, [])

  async function handlePublish(post) {
    setBusy(post.id)
    try {
      if (post.published) await unpublishPost(post.id)
      else await publishPost(post.id)
      await reload()
    } finally { setBusy(null) }
  }

  async function handleDelete(post) {
    if (!window.confirm(`"${post.title}" wirklich löschen?`)) return
    setBusy(post.id)
    try { await deletePost(post.id); await reload() }
    finally { setBusy(null) }
  }

  return (
    <div>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>Blog-Artikel</h1>
        <Link to="/admin/blog/neu" className={styles.newBtn}>+ Neuer Artikel</Link>
      </div>

      {loading && <p className={styles.empty}>Lade...</p>}
      {!loading && !posts.length && <p className={styles.empty}>Noch keine Artikel. Erstelle den ersten!</p>}

      <div className={styles.table}>
        {posts.map(post => (
          <div key={post.id} className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={`${styles.statusDot} ${post.published ? styles.dotPublished : styles.dotDraft}`} />
              <div>
                <div className={styles.rowTitle}>{post.title}</div>
                <div className={styles.rowMeta}>
                  {post.contentType} · {post.published ? 'Veröffentlicht' : 'Entwurf'}
                  {post.publishedAt && ` · ${new Date(post.publishedAt.toDate?.() ?? post.publishedAt).toLocaleDateString('de-AT')}`}
                </div>
              </div>
            </div>
            <div className={styles.rowActions}>
              <Link to={`/admin/blog/${post.id}`} className={styles.editBtn}>Bearbeiten</Link>
              <button className={`${styles.publishBtn} ${post.published ? styles.unpublishBtn : ''}`}
                onClick={() => handlePublish(post)} disabled={busy === post.id}>
                {post.published ? 'Zurückziehen' : 'Veröffentlichen'}
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(post)} disabled={busy === post.id}>
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Erstelle `src/pages/admin/AdminBlogListPage.module.css`**

```css
.topBar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.heading { font-size: 1.5rem; font-weight: 900; margin: 0; font-family: var(--font-display); }
.newBtn { background: var(--primary); color: #fff; font-weight: 800; font-size: 0.9rem; padding: 0.6rem 1.25rem; border-radius: var(--radius-lg); text-decoration: none; transition: background .15s; }
.newBtn:hover { background: var(--primary-dark); }
.empty { color: var(--text-muted); padding: 2rem 0; }
.table { display: flex; flex-direction: column; gap: 0.5rem; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--surface); border: var(--border-1) solid var(--border); border-radius: var(--radius-lg); padding: 0.875rem 1rem; flex-wrap: wrap; }
.rowInfo { display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0; }
.statusDot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dotPublished { background: #22c55e; }
.dotDraft     { background: var(--border-strong); }
.rowTitle { font-weight: 800; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rowMeta  { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
.rowActions { display: flex; gap: 0.5rem; flex-shrink: 0; }
.editBtn { font-size: 0.8rem; font-weight: 700; color: var(--primary); text-decoration: none; padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); border: var(--border-1) solid var(--primary); transition: background .12s; }
.editBtn:hover { background: rgba(79,70,229,.08); }
.publishBtn { font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); border: none; background: #dcfce7; color: #15803d; cursor: pointer; font-family: inherit; transition: background .12s; }
.publishBtn:hover { background: #bbf7d0; }
.unpublishBtn { background: var(--surface-2); color: var(--text-muted); }
.unpublishBtn:hover { background: var(--border); }
.deleteBtn { font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); border: none; background: #fee2e2; color: var(--danger); cursor: pointer; font-family: inherit; transition: background .12s; }
.deleteBtn:hover { background: #fecaca; }
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminBlogListPage.jsx src/pages/admin/AdminBlogListPage.module.css
git commit -m "feat: AdminBlogListPage with publish/delete"
```

---

### Task 12: BlogEditorPage (TipTap + Formular)

**Files:**
- Create: `src/pages/admin/BlogEditorPage.jsx`
- Create: `src/pages/admin/BlogEditorPage.module.css`

- [ ] **Step 1: Erstelle `src/pages/admin/BlogEditorPage.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPostById, createPost, updatePost, publishPost, generateSlug } from '../../lib/blogData.js'
import TipTapEditor from '../../components/editor/TipTapEditor.jsx'
import styles from './BlogEditorPage.module.css'

const EMPTY_FORM = {
  title: '', slug: '', excerpt: '', contentType: 'artikel',
  audience: 'alle', tags: '', coverImage: '', author: '',
  sourceUrl: '', sourceAuthor: '', sourceYear: '',
  content: null,
}

export default function BlogEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [form, setForm]   = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [post, setPost]     = useState(null)

  useEffect(() => {
    if (!isNew) {
      getPostById(id).then(p => {
        if (!p) return navigate('/admin/blog', { replace: true })
        setPost(p)
        setForm({
          title: p.title ?? '',
          slug: p.slug ?? '',
          excerpt: p.excerpt ?? '',
          contentType: p.contentType ?? 'artikel',
          audience: p.audience ?? 'alle',
          tags: (p.tags ?? []).join(', '),
          coverImage: p.coverImage ?? '',
          author: p.author ?? '',
          sourceUrl: p.sourceUrl ?? '',
          sourceAuthor: p.sourceAuthor ?? '',
          sourceYear: p.sourceYear ?? '',
          content: p.content ?? null,
        })
      })
    }
  }, [id])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (field === 'title' && isNew) {
      setForm(f => ({ ...f, title: value, slug: generateSlug(value) }))
    }
    setError('')
  }

  function getPayload(published = false) {
    if (!form.title.trim()) throw new Error('Titel ist Pflichtfeld')
    if (!form.slug.trim())  throw new Error('Slug ist Pflichtfeld')
    return {
      title:        form.title.trim(),
      slug:         form.slug.trim(),
      excerpt:      form.excerpt.trim(),
      contentType:  form.contentType,
      audience:     form.audience,
      tags:         form.tags.split(',').map(t => t.trim()).filter(Boolean),
      coverImage:   form.coverImage.trim() || null,
      author:       form.author.trim(),
      content:      form.content ?? { type: 'doc', content: [] },
      sourceUrl:    form.contentType === 'studie' ? (form.sourceUrl.trim() || null) : null,
      sourceAuthor: form.contentType === 'studie' ? (form.sourceAuthor.trim() || null) : null,
      sourceYear:   form.contentType === 'studie' && form.sourceYear ? Number(form.sourceYear) : null,
    }
  }

  async function handleSave(publish = false) {
    setSaving(true)
    setError('')
    try {
      const payload = getPayload(publish)
      if (isNew) {
        const ref = await createPost(payload)
        if (publish) await publishPost(ref.id)
      } else {
        await updatePost(id, payload)
        if (publish && !post?.published) await publishPost(id)
      }
      navigate('/admin/blog')
    } catch (e) {
      setError(e.message || 'Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.heading}>{isNew ? 'Neuer Artikel' : 'Artikel bearbeiten'}</h1>
        <div className={styles.actions}>
          <button className={styles.draftBtn} onClick={() => handleSave(false)} disabled={saving}>
            {saving ? 'Speichern...' : 'Als Entwurf speichern'}
          </button>
          <button className={styles.publishBtn} onClick={() => handleSave(true)} disabled={saving}>
            {saving ? '...' : '🚀 Veröffentlichen'}
          </button>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        <div className={styles.main}>
          <label className={styles.label}>Titel *</label>
          <input className={styles.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Artikel-Titel..." />

          <label className={styles.label}>Inhalt *</label>
          <TipTapEditor value={form.content} onChange={content => set('content', content)} />
        </div>

        <div className={styles.sidebar}>
          <label className={styles.label}>Slug (URL) *</label>
          <input className={styles.input} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="mein-artikel-titel" />

          <label className={styles.label}>Excerpt (max 200 Zeichen)</label>
          <textarea className={styles.textarea} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Kurzbeschreibung..." maxLength={200} rows={3} />
          <span className={styles.charCount}>{form.excerpt.length}/200</span>

          <label className={styles.label}>Typ</label>
          <select className={styles.select} value={form.contentType} onChange={e => set('contentType', e.target.value)}>
            <option value="artikel">Artikel</option>
            <option value="studie">Studie</option>
            <option value="tipp">Tipp</option>
          </select>

          <label className={styles.label}>Zielgruppe</label>
          <select className={styles.select} value={form.audience} onChange={e => set('audience', e.target.value)}>
            <option value="alle">Alle</option>
            <option value="eltern">Eltern</option>
            <option value="kinder">Kinder</option>
            <option value="lehrer">Lehrer</option>
          </select>

          <label className={styles.label}>Tags (kommagetrennt)</label>
          <input className={styles.input} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="grammatik, lesen, mathe" />

          <label className={styles.label}>Autor</label>
          <input className={styles.input} value={form.author} onChange={e => set('author', e.target.value)} placeholder="Name des Autors" />

          <label className={styles.label}>Cover-Bild URL (optional)</label>
          <input className={styles.input} value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://..." />

          {form.contentType === 'studie' && (
            <>
              <label className={styles.label}>Quellen-URL</label>
              <input className={styles.input} value={form.sourceUrl} onChange={e => set('sourceUrl', e.target.value)} placeholder="https://..." />
              <label className={styles.label}>Quellen-Autor</label>
              <input className={styles.input} value={form.sourceAuthor} onChange={e => set('sourceAuthor', e.target.value)} placeholder="Nachname, Vorname" />
              <label className={styles.label}>Jahr</label>
              <input className={styles.input} type="number" value={form.sourceYear} onChange={e => set('sourceYear', e.target.value)} placeholder="2024" min={1900} max={2099} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Erstelle `src/pages/admin/BlogEditorPage.module.css`**

```css
.page { max-width: 1200px; }
.topBar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.heading { font-size: 1.4rem; font-weight: 900; margin: 0; font-family: var(--font-display); }
.actions { display: flex; gap: 0.75rem; }
.draftBtn { padding: 0.6rem 1.25rem; border-radius: var(--radius-lg); border: var(--border-2) solid var(--border); background: var(--surface); font-weight: 700; font-size: 0.88rem; font-family: inherit; cursor: pointer; color: var(--text-muted); transition: border-color .15s; }
.draftBtn:hover { border-color: var(--primary); color: var(--primary); }
.publishBtn { padding: 0.6rem 1.25rem; border-radius: var(--radius-lg); border: none; background: var(--primary); color: #fff; font-weight: 800; font-size: 0.88rem; font-family: inherit; cursor: pointer; transition: background .15s; }
.publishBtn:hover { background: var(--primary-dark); }
.error { color: var(--danger); font-size: 0.88rem; font-weight: 600; margin-bottom: 1rem; }
.grid { display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; align-items: start; }
.main { display: flex; flex-direction: column; gap: 0.75rem; }
.sidebar { display: flex; flex-direction: column; gap: 0.5rem; background: var(--surface); border: var(--border-1) solid var(--border); border-radius: var(--radius-xl); padding: 1.25rem; }
.label { font-size: 0.8rem; font-weight: 800; color: var(--text-muted); margin-top: 0.5rem; }
.input, .select { width: 100%; padding: 0.5rem 0.75rem; border: var(--border-2) solid var(--border); border-radius: var(--radius); font-size: 0.88rem; font-family: inherit; background: var(--bg); color: var(--text); transition: border-color .15s; }
.input:focus, .select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.textarea { width: 100%; padding: 0.5rem 0.75rem; border: var(--border-2) solid var(--border); border-radius: var(--radius); font-size: 0.88rem; font-family: inherit; background: var(--bg); color: var(--text); resize: vertical; transition: border-color .15s; }
.textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.charCount { font-size: 0.72rem; color: var(--text-light); text-align: right; }
@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/BlogEditorPage.jsx src/pages/admin/BlogEditorPage.module.css
git commit -m "feat: BlogEditorPage with TipTap + form"
```

---

### Task 13: App.jsx Routen aktualisieren

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Neue Imports hinzufügen** (nach der bestehenden `LandingPage` Import-Zeile)

Füge diese Imports am Ende des Lazy-Import-Blocks hinzu (nach `EinmaleinsBlitz`):

```jsx
const BlogListPage        = lazy(() => import('./pages/blog/BlogListPage.jsx'))
const BlogPostPublicPage  = lazy(() => import('./pages/blog/BlogPostPublicPage.jsx'))
const BlogPostPage        = lazy(() => import('./pages/blog/BlogPostPage.jsx'))
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminBlogListPage   = lazy(() => import('./pages/admin/AdminBlogListPage.jsx'))
const BlogEditorPage      = lazy(() => import('./pages/admin/BlogEditorPage.jsx'))
```

- [ ] **Step 2: Neue Routen hinzufügen**

In der `Routes`-Sektion, vor dem `<Route path="*" ...>`:

```jsx
          {/* Blog (öffentlich) */}
          <Route path="/blog"       element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPublicPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/blog" replace />} />
            <Route path="blog"     element={<AdminBlogListPage />} />
            <Route path="blog/neu" element={<BlogEditorPage />} />
            <Route path="blog/:id" element={<BlogEditorPage />} />
          </Route>
```

Im `/app`-Block, nach `profil`:

```jsx
            <Route path="blog"       element={<BlogListPage basePath="/app/blog" showHeader={false} />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
```

- [ ] **Step 3: Build prüfen**

```bash
npm run build 2>&1 | tail -10
```

Expected: `built in` ohne Fehler.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add blog + admin routes to App.jsx"
```

---

### Task 14: LandingPage + NavBar + Dashboard updaten

**Files:**
- Modify: `src/pages/LandingPage.jsx`
- Modify: `src/pages/LandingPage.module.css`
- Modify: `src/components/layout/NavBar.jsx`
- Modify: `src/pages/app/DashboardPage.jsx`
- Modify: `src/pages/app/DashboardPage.module.css`

- [ ] **Step 1: LandingPage.jsx — Blog-Link im Header + "Aus unserem Blog" Sektion**

Im `<nav>` des Headers, vor `<Link to="/start" className={styles.navLink}>`, füge hinzu:

```jsx
<Link to="/blog" className={styles.navLink}>Blog</Link>
```

Direkt vor dem `{/* CTA Banner */}` Block, füge die neue Sektion ein:

```jsx
      {/* Blog-Vorschau */}
      <section className={styles.blogPreview}>
        <div className={styles.blogPreviewInner}>
          <h2 className={styles.sectionTitle}>Aus unserem Blog 📖</h2>
          <BlogPreviewSection />
          <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <Link to="/blog" className={styles.ctaSecondary} style={{ display:'inline-flex' }}>
              Alle Artikel ansehen →
            </Link>
          </div>
        </div>
      </section>
```

Füge oben in `LandingPage.jsx` diese Imports und Komponente ein (nach dem bestehenden Import-Block):

```jsx
import { useEffect, useState } from 'react'
import { getLatestPosts } from '../lib/blogData.js'
import PostCard from '../components/blog/PostCard.jsx'

function BlogPreviewSection() {
  const [posts, setPosts] = useState([])
  useEffect(() => { getLatestPosts(3).then(setPosts).catch(() => {}) }, [])
  if (!posts.length) return null
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem' }}>
      {posts.map(p => <PostCard key={p.id} post={p} href={`/blog/${p.slug}`} />)}
    </div>
  )
}
```

- [ ] **Step 2: LandingPage.module.css — Blog-Preview Sektion**

Füge am Ende der Datei hinzu:

```css
/* ---- Blog Preview ---- */
.blogPreview { padding: 4rem 1.5rem; background: var(--bg); }
.blogPreviewInner { max-width: 1100px; margin: 0 auto; }
```

- [ ] **Step 3: NavBar.jsx — Blog-Link hinzufügen**

Im `<div className={styles.links}>` Block, füge nach dem Dashboard-Link hinzu:

```jsx
          <NavLink to="/app/blog" className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
            Blog
          </NavLink>
```

- [ ] **Step 4: DashboardPage.jsx — Empfehlungs-Sektion**

Füge oben nach den bestehenden Imports hinzu:

```jsx
import { useRecommendedPosts } from '../../hooks/useRecommendedPosts.js'
import PostCard from '../../components/blog/PostCard.jsx'
```

Im `DashboardPage`-Komponent, nach der `featured`-Konstante:

```jsx
  const recommendedPosts = useRecommendedPosts(profile)
```

Füge nach dem `{/* ── Tagesaufgabe ── */}` Block und vor `{/* ── Tabs ── */}` ein:

```jsx
      {/* ── Blog-Empfehlungen ── */}
      {recommendedPosts.length > 0 && (
        <section className={styles.recommendedSection}>
          <div className={styles.featuredBadge}>📚 Für dich empfohlen</div>
          <div className={styles.recommendedGrid}>
            {recommendedPosts.map(post => (
              <PostCard key={post.id} post={post} href={`/app/blog/${post.slug}`} />
            ))}
          </div>
        </section>
      )}
```

- [ ] **Step 5: DashboardPage.module.css — Empfehlungs-Styles**

Füge am Ende der Datei hinzu:

```css
/* ── Blog-Empfehlungen ── */
.recommendedSection { display: flex; flex-direction: column; gap: 0.65rem; }
.recommendedGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
@media (max-width: 640px) {
  .recommendedGrid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Build prüfen**

```bash
npm run build 2>&1 | tail -10
```

Expected: `built in` ohne Fehler.

- [ ] **Step 7: Commit und Push**

```bash
git add src/pages/LandingPage.jsx src/pages/LandingPage.module.css
git add src/components/layout/NavBar.jsx
git add src/pages/app/DashboardPage.jsx src/pages/app/DashboardPage.module.css
git commit -m "feat: Blog-Link in LandingPage+NavBar, Empfehlungen im Dashboard"
git push origin main
```

---

## Self-Review

**Spec-Coverage-Check:**
- ✅ Section 1 (Datenmodell) → Task 2
- ✅ Section 2 (Routen) → Task 13
- ✅ Section 3 (Seiten & Komponenten) → Tasks 4-12
- ✅ Section 4 (BlogListPage) → Task 7
- ✅ Section 5 (BlogPostPublicPage) → Task 8
- ✅ Section 6 (BlogPostPage) → Task 9
- ✅ Section 7 (Admin-Panel) → Tasks 10-12
- ✅ Section 8 (Empfehlungs-System) → Task 3 + Task 14 Step 4
- ✅ Section 9 (npm Dependencies) → Task 1
- ✅ LandingPage Blog-Sektion → Task 14 Step 1
- ✅ NavBar Blog-Link → Task 14 Step 3

**Placeholder-Scan:** Keine TBDs, alle Code-Blöcke vollständig.

**Type-Konsistenz:**
- `generateSlug` in Task 2 → verwendet in Task 12 ✅
- `getPostBySlug`, `getPostById`, `getAllPosts` in Task 2 → verwendet in Tasks 8, 9, 11, 12 ✅
- `PostCard` props `{ post, href }` in Task 4 → verwendet in Tasks 7, 9, 14 ✅
- `TipTapEditor` props `{ value, onChange }` in Task 6 → verwendet in Task 12 ✅
- `useRecommendedPosts(profile)` in Task 3 → verwendet in Task 14 ✅
