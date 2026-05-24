import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#fff"/>
              <path d="M8 22c2-6 6-10 8-10s6 4 8 10" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="10" r="3" fill="#fbbf24"/>
            </svg>
            DeutschOcean
          </Link>
          <div className="flex gap-3">
            <Link href="/blog" className="px-4 py-2 hover:bg-white/10 rounded-xl transition">Blog</Link>
            <Link href="/login" className="px-4 py-2 hover:bg-white/10 rounded-xl transition">Anmelden</Link>
            <Link href="/registrieren" className="px-4 py-2 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-blue-50 transition">Starten</Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-20 sm:py-32 text-center">
          <div className="text-7xl mb-6">🌊🐋</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight">
            Deutschlernen wird zum Abenteuer
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Über 25 Lernspiele, ein KI-Tutor und Abenteuer-Kampagnen.
            Spielerisch Deutsch, Mathe und mehr lernen — in der Schule, zu Hause oder unterwegs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/registrieren"
              className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-blue-50 transition shadow-lg">
              🎮 Kostenlos starten
            </Link>
            <Link href="/login"
              className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition border border-white/20">
              Schon registriert? Anmelden
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Was dich erwartet</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: '🎮', title: '25+ Lernspiele', desc: 'Von Buchstabenchaos bis Einmaleins-Blitz — Spiele für jedes Alter.' },
              { emoji: '🐙', title: 'KI-Tutor Ozzy', desc: 'Stell Fragen, lass dir Sachen erklären — Ozzy hilft 24/7.' },
              { emoji: '🏆', title: 'Belohnungen', desc: 'Sammle XP, Sterne und Badges. Halte deinen Streak am Leben.' },
              { emoji: '📚', title: 'Spaced Repetition', desc: 'Smart-Wiederholung sorgt dafür, dass nichts vergessen wird.' },
              { emoji: '🌊', title: '6 Welten', desc: 'Wahrnehmung, Grammatik, Mathe und mehr — entdecke alle.' },
              { emoji: '👨‍👩‍👧', title: 'Für Eltern', desc: 'E-Mail-Reports und Übersicht über den Lernfortschritt.' },
            ].map(f => (
              <div key={f.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-4xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-indigo-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Bereit für dein Abenteuer?</h2>
        <p className="text-white/80 mb-6">Kostenlos starten, jederzeit abmelden.</p>
        <Link href="/registrieren"
          className="inline-block px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold hover:bg-blue-50 transition shadow-lg">
          Jetzt loslegen →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} DeutschOcean</p>
          <div className="flex gap-4 text-sm">
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <Link href="/login" className="hover:text-white">Anmelden</Link>
            <a href="mailto:hallo@deutschocean.de" className="hover:text-white">Kontakt</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
