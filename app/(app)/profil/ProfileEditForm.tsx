'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

const AVATARS = ['🐬','🦁','🦊','🐸','🦄','🐧','🦋','🐼','🦖','🐙']
const MODULES = [
  { id:'kindergarten', emoji:'🧒', label:'Kindergarten'    },
  { id:'volksschule',  emoji:'📚', label:'Volksschule'     },
  { id:'hauptschule',  emoji:'🎓', label:'Hauptschule/NMS' },
]

interface Props {
  initialName: string
  initialAvatar: string
  initialModule: string
}

export default function ProfileEditForm({ initialName, initialAvatar, initialModule }: Props) {
  const router = useRouter()
  const [name, setName]     = useState(initialName)
  const [avatar, setAvatar] = useState(initialAvatar)
  const [mod, setMod]       = useState(initialModule)
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/profile/update', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar, schoolModule: mod }),
    })
    setSaving(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return }
    await fetch('/api/profile/update', { method: 'DELETE' })
    await signOut({ callbackUrl: '/' })
  }

  return (
    <section className="bg-white rounded-2xl p-5 border border-gray-100">
      <h2 className="font-bold mb-4">⚙️ Einstellungen</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`text-3xl p-2 rounded-xl border-2 transition ${avatar === a ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schulstufe</label>
          <div className="grid grid-cols-3 gap-2">
            {MODULES.map(m => (
              <button key={m.id} onClick={() => setMod(m.id)}
                className={`p-3 rounded-xl border-2 transition ${mod === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-2xl">{m.emoji}</div>
                <div className="text-xs mt-1">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Speichert...' : 'Speichern'}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          🚪 Abmelden
        </button>
        <button onClick={handleDelete}
          className={`w-full py-2 rounded-xl transition ${confirmDel ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-500 hover:bg-red-50'}`}>
          {confirmDel ? '⚠️ Wirklich löschen? Klick nochmal' : '🗑 Konto löschen'}
        </button>
      </div>
    </section>
  )
}
