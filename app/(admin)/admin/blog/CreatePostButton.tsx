'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePostButton() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  async function create() {
    const title = prompt('Titel des neuen Artikels:')
    if (!title?.trim()) return
    setCreating(true)
    const res = await fetch('/api/admin/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (res.ok) {
      const data = await res.json() as { id: string }
      router.push(`/admin/blog/${data.id}`)
    } else {
      alert('Fehler beim Anlegen')
      setCreating(false)
    }
  }

  return (
    <button onClick={create} disabled={creating}
      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
      {creating ? 'Lädt…' : '+ Neuer Artikel'}
    </button>
  )
}
