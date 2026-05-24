// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  avatar: string
  schoolModule: string
  isAdmin: boolean
  xp: number
  stars: number
  streakDays: number
  lastActive: string | null
  totalHints: number
  createdAt: string
}

// ─── Session (NextAuth) ───────────────────────────────────────────────────────
export interface SessionUser {
  id: string
  email: string
  name: string
  avatar: string
  isAdmin: boolean
  schoolModule: string
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export interface SpacedRepetitionItem {
  missionId: string
  interval: number
  easeFactor: number
  repetitions: number
  nextDue: string    // ISO date
}

export interface WeakGame {
  missionId: string
  count: number
}

export interface GameSessionResult {
  missionId: string
  accuracy: number   // 0–1
  xpEarned: number
  starsEarned: number
  hintsUsed: number
  answerSpeedMs?: number
  riskProfile?: RiskProfile
}

export type RiskProfile =
  | 'fast-risk-taker'
  | 'cautious-learner'
  | 'confident'
  | 'help-seeker'
  | 'balanced'

// ─── Dashboard Data ───────────────────────────────────────────────────────────
export interface DashboardProfile extends User {
  completedMissions: string[]
  unlockedBadges: string[]
  spacedRepetition: SpacedRepetitionItem[]
  weakGames: WeakGame[]
  campaignProgress: CampaignProgress[]
}

// ─── Campaigns ────────────────────────────────────────────────────────────────
export interface CampaignProgress {
  campaignId: string
  stepIndex: number
  choices: Record<string, string>
  completed: boolean
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  coverImage: string | null
  authorId: string | null
  published: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// ─── Mastery ──────────────────────────────────────────────────────────────────
export type MasteryRank = 'Neuling' | 'Anfänger' | 'Lehrling' | 'Profi' | 'Meister'

export interface WorldMastery {
  worldId: string
  rank: MasteryRank
  plays: number
  weakPercent: number
}
