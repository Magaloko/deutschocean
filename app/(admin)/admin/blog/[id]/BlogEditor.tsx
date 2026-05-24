'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  id: string
  initialSlug: string; initialTitle: string; initialContent: string
  initialExcerpt: string; initialCover: string; initialTags: string
  initialPublished: boolean
}

export default function BlogEditor({ id, initialSlug, initialTitle, initialContent, initialExcerpt, initialCover, initialTags, initialPublished }: Props) {
  const router = useRouter()
  const [title, setTitle]       = useState(initialTitle)
  const [slug, setSlug]         = useState(initialSlug)
  const [excerpt, setExcerpt]   = useState(initialExcerpt)
  const [cover, setCover]       = useState(initialCover)
  const [tags, setTags]         = useState(initialTags)
  const [published, setPub]     = useState(initialPublished)
  const [saving, setSaving]     = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Schreib deinen Artikel...' }),
    ],
    content: initialContent,
    immediatelyRender: false,
  })

  async function handleSave() {
    if (!editor) return
    setSaving(true)
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, slug, excerpt, cover_image: cover || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        published, content: editor.getHTML(),
      }),
    })
    setSaving(false)
    if (res.ok) {
      setLastSaved(new Date().toLocaleTimeString('de-DE'))
    } else alert('Fehler beim Speichern')
  }

  async function handleDelete() {
    if (!confirm('Wirklich löschen?')) return
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/blog')
    else alert('Fehler beim Löschen')
  }

  if (!editor) return <div className="p-12 text-center">Lädt…</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/admin/blog')} className="text-sm text-gray-500 hover:text-gray-700">← Liste</button>
        <div className="flex items-center gap-2">
          {lastSaved && <span className="text-xs text-gray-400">Gespeichert um {lastSaved}</span>}
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Speichert…' : 'Speichern'}
          </button>
          <button onClick={handleDelete} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl">🗑</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Titel"
          className="w-full text-3xl font-bold focus:outline-none placeholder:text-gray-300" />

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <input value={slug} onChange={e => setSlug(e.target.value)}
            placeholder="slug" className="px-3 py-2 border border-gray-200 rounded-lg" />
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="Tags (kommasepariert)" className="px-3 py-2 border border-gray-200 rounded-lg" />
        </div>
        <input value={cover} onChange={e => setCover(e.target.value)}
          placeholder="Cover-Bild URL (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
          placeholder="Kurzbeschreibung (optional)" rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={e => setPub(e.target.checked)} />
          Veröffentlicht
        </label>

        {/* Editor Toolbar */}
        <div className="border-t pt-4 flex flex-wrap gap-1">
          <button onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><strong>B</strong></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><em>I</em></button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>H2</button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>H3</button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>• Liste</button>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 rounded ${editor.isActive('blockquote') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>"</button>
          <button onClick={() => {
            const url = prompt('Link URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }} className="px-3 py-1 rounded hover:bg-gray-100">🔗</button>
        </div>

        {/* Editor */}
        <EditorContent editor={editor}
          className="prose max-w-none min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]" />
      </div>
    </div>
  )
}
