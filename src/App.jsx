import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import Spinner from './components/ui/Spinner.jsx'

// Lazy-load aller Seiten
const StartPage        = lazy(() => import('./pages/StartPage.jsx'))
const DashboardPage    = lazy(() => import('./pages/app/DashboardPage.jsx'))
const FehlerDetektiv   = lazy(() => import('./pages/app/games/FehlerDetektiv.jsx'))
const Personenbeschreibung = lazy(() => import('./pages/app/games/Personenbeschreibung.jsx'))
const DiktatModus      = lazy(() => import('./pages/app/games/DiktatModus.jsx'))
const SilbenPuzzle     = lazy(() => import('./pages/app/games/SilbenPuzzle.jsx'))
const BuchstabenChaos  = lazy(() => import('./pages/app/games/BuchstabenChaos.jsx'))
const NomenFinder      = lazy(() => import('./pages/app/games/NomenFinder.jsx'))
const SatzBuilder      = lazy(() => import('./pages/app/games/SatzBuilder.jsx'))
const FarbenJaeger     = lazy(() => import('./pages/app/games/FarbenJaeger.jsx'))
const TierGeraeusche   = lazy(() => import('./pages/app/games/TierGeraeusche.jsx'))
const MemorySpiel      = lazy(() => import('./pages/app/games/MemorySpiel.jsx'))
const WasFehlt         = lazy(() => import('./pages/app/games/WasFehlt.jsx'))
const FalscherGegenstand = lazy(() => import('./pages/app/games/FalscherGegenstand.jsx'))
const EmotionenSpiel   = lazy(() => import('./pages/app/games/EmotionenSpiel.jsx'))
const FahrzeugLenker   = lazy(() => import('./pages/app/games/FahrzeugLenker.jsx'))
const TierWissen       = lazy(() => import('./pages/app/games/TierWissen.jsx'))
const EmojiGeschichte  = lazy(() => import('./pages/app/games/EmojiGeschichte.jsx'))
const EmojiBaukasten   = lazy(() => import('./pages/app/games/EmojiBaukasten.jsx'))
const EmotionenKarten  = lazy(() => import('./pages/app/games/EmotionenKarten.jsx'))

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size="xl" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Onboarding */}
          <Route path="/"      element={<Navigate to="/app" replace />} />
          <Route path="/start" element={<StartPage />} />

          {/* App-Seiten (AppLayout leitet zu /start wenn kein Profil) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="missionen" element={<Navigate to="/app" replace />} />
            <Route path="spiel/fehler-detektiv"       element={<FehlerDetektiv />} />
            <Route path="spiel/personenbeschreibung"  element={<Personenbeschreibung />} />
            <Route path="spiel/diktat"                element={<DiktatModus />} />
            <Route path="spiel/silben-puzzle"         element={<SilbenPuzzle />} />
            <Route path="spiel/buchstaben-chaos"      element={<BuchstabenChaos />} />
            <Route path="spiel/nomen-finder"          element={<NomenFinder />} />
            <Route path="spiel/satz-builder"          element={<SatzBuilder />} />
            <Route path="spiel/farben-jaeger"          element={<FarbenJaeger />} />
            <Route path="spiel/tier-geraeusche"        element={<TierGeraeusche />} />
            <Route path="spiel/memory"                 element={<MemorySpiel />} />
            <Route path="spiel/was-fehlt"              element={<WasFehlt />} />
            <Route path="spiel/falscher-gegenstand"    element={<FalscherGegenstand />} />
            <Route path="spiel/emotionen"              element={<EmotionenSpiel />} />
            <Route path="spiel/fahrzeug-lenker"        element={<FahrzeugLenker />} />
            <Route path="spiel/tier-wissen"            element={<TierWissen />} />
            <Route path="spiel/emoji-geschichte"       element={<EmojiGeschichte />} />
            <Route path="spiel/emoji-baukasten"        element={<EmojiBaukasten />} />
            <Route path="spiel/emotionen-karten"       element={<EmotionenKarten />} />
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
