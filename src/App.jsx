import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import Spinner from './components/ui/Spinner.jsx'

// Lazy-load aller Seiten
const LandingPage      = lazy(() => import('./pages/LandingPage.jsx'))
const StartPage        = lazy(() => import('./pages/StartPage.jsx'))
const LoginPage        = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage     = lazy(() => import('./pages/RegisterPage.jsx'))
const ProfilePage      = lazy(() => import('./pages/app/ProfilePage.jsx'))
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
const FruechtZaehlen   = lazy(() => import('./pages/app/games/FruechtZaehlen.jsx'))
const Zahlenstrahl    = lazy(() => import('./pages/app/games/mathe/Zahlenstrahl.jsx'))
const RegelRaupe      = lazy(() => import('./pages/app/games/RegelRaupe.jsx'))
const WortFamilien    = lazy(() => import('./pages/app/games/WortFamilien.jsx'))

// Blog
const BlogListPage       = lazy(() => import('./pages/blog/BlogListPage.jsx'))
const BlogPostPublicPage = lazy(() => import('./pages/blog/BlogPostPublicPage.jsx'))
const BlogPostPage       = lazy(() => import('./pages/blog/BlogPostPage.jsx'))

// Admin
const AdminLayout          = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminDashboardPage   = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'))
const AdminUsersPage       = lazy(() => import('./pages/admin/AdminUsersPage.jsx'))
const AdminBlogListPage    = lazy(() => import('./pages/admin/AdminBlogListPage.jsx'))
const BlogEditorPage       = lazy(() => import('./pages/admin/BlogEditorPage.jsx'))
const MehrWeniger     = lazy(() => import('./pages/app/games/mathe/MehrWeniger.jsx'))
const MinusRakete     = lazy(() => import('./pages/app/games/mathe/MinusRakete.jsx'))
const Zahlenfolge     = lazy(() => import('./pages/app/games/mathe/Zahlenfolge.jsx'))
const WuerfelRechnen  = lazy(() => import('./pages/app/games/mathe/WuerfelRechnen.jsx'))
const MiniMarkt       = lazy(() => import('./pages/app/games/mathe/MiniMarkt.jsx'))
const EinmaleinsBlitz = lazy(() => import('./pages/app/games/mathe/EinmaleinsBlitz.jsx'))
const StatsPage       = lazy(() => import('./pages/app/StatsPage.jsx'))
const ChatPage        = lazy(() => import('./pages/app/ChatPage.jsx'))
const RoboterSchule   = lazy(() => import('./pages/app/fach/RoboterSchule.jsx'))
const CoderKids       = lazy(() => import('./pages/app/fach/CoderKids.jsx'))
const MiniBoss        = lazy(() => import('./pages/app/fach/MiniBoss.jsx'))
const CoolBleiben     = lazy(() => import('./pages/app/fach/CoolBleiben.jsx'))
const WeltPage        = lazy(() => import('./pages/app/WeltPage.jsx'))
const CampaignPage    = lazy(() => import('./pages/app/CampaignPage.jsx'))

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
          <Route path="/"             element={<LandingPage />} />
          <Route path="/start"        element={<StartPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/registrieren" element={<RegisterPage />} />

          {/* App-Seiten (AppLayout leitet zu /start wenn kein Profil) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profil" element={<ProfilePage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="chat" element={<ChatPage />} />
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
            <Route path="spiel/fruechtZaehlen"          element={<FruechtZaehlen />} />
            <Route path="spiel/regel-raupe"            element={<RegelRaupe />} />
            <Route path="spiel/wort-familien"          element={<WortFamilien />} />
            <Route path="mathe/zahlenstrahl"    element={<Zahlenstrahl />} />
            <Route path="mathe/mehr-weniger"    element={<MehrWeniger />} />
            <Route path="mathe/minus-rakete"    element={<MinusRakete />} />
            <Route path="mathe/zahlenfolge"     element={<Zahlenfolge />} />
            <Route path="mathe/wuerfel-rechnen" element={<WuerfelRechnen />} />
            <Route path="mathe/mini-markt"      element={<MiniMarkt />} />
            <Route path="mathe/einmaleins"      element={<EinmaleinsBlitz />} />
            <Route path="fach/roboter"          element={<RoboterSchule />} />
            <Route path="fach/coden"            element={<CoderKids />} />
            <Route path="fach/miniboss"         element={<MiniBoss />} />
            <Route path="fach/cool"             element={<CoolBleiben />} />
            <Route path="welt/:weltId"          element={<WeltPage />} />
            <Route path="kampagne/:campaignId"  element={<CampaignPage />} />
          </Route>

          {/* Blog (public) */}
          <Route path="blog">
            <Route index element={<BlogListPage />} />
            <Route path=":slug" element={<BlogPostPublicPage />} />
          </Route>

          {/* Blog (logged in) */}
          <Route path="app/blog">
            <Route index element={<BlogListPage basePath="/app/blog" showHeader={false} />} />
            <Route path=":slug" element={<BlogPostPage />} />
          </Route>

          {/* Admin */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="blog" element={<AdminBlogListPage />} />
            <Route path="blog/neu" element={<BlogEditorPage />} />
            <Route path="blog/:id" element={<BlogEditorPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
