-- DeutschOcean PostgreSQL Schema
-- Schema: sebo (App-Daten)

CREATE SCHEMA IF NOT EXISTS sebo;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE sebo.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,                          -- NULL bei Google OAuth
  name          TEXT NOT NULL DEFAULT '',
  avatar        TEXT NOT NULL DEFAULT 'wal',
  school_module TEXT NOT NULL DEFAULT 'grundschule',
  is_admin      BOOLEAN NOT NULL DEFAULT false,

  -- Gamification
  xp            INTEGER NOT NULL DEFAULT 0,
  stars         INTEGER NOT NULL DEFAULT 0,
  streak_days   INTEGER NOT NULL DEFAULT 0,
  last_active   DATE,
  total_hints   INTEGER NOT NULL DEFAULT 0,

  -- OAuth
  google_id     TEXT UNIQUE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Completed Missions ────────────────────────────────────────────────────────
CREATE TABLE sebo.completed_missions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  mission_id   TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);

CREATE INDEX ON sebo.completed_missions(user_id);

-- ─── Spaced Repetition ────────────────────────────────────────────────────────
-- SM-2 Algorithmus: interval, ease_factor, repetitions, next_due
CREATE TABLE sebo.spaced_repetition (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  mission_id   TEXT NOT NULL,
  interval     INTEGER NOT NULL DEFAULT 1,       -- Tage bis nächste Wiederholung
  ease_factor  NUMERIC(4,2) NOT NULL DEFAULT 2.5,
  repetitions  INTEGER NOT NULL DEFAULT 0,
  next_due     DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);

CREATE INDEX ON sebo.spaced_repetition(user_id, next_due);

-- ─── Weak Games ───────────────────────────────────────────────────────────────
-- Zählt wie oft ein Spiel mit < 60% Genauigkeit abgeschlossen wurde
CREATE TABLE sebo.weak_games (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, mission_id)
);

CREATE INDEX ON sebo.weak_games(user_id);

-- ─── Badges ───────────────────────────────────────────────────────────────────
CREATE TABLE sebo.user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- ─── Game Sessions (Metriken / Analytics) ────────────────────────────────────
CREATE TABLE sebo.game_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  mission_id      TEXT NOT NULL,
  accuracy        NUMERIC(5,4) NOT NULL,         -- 0.0 – 1.0
  xp_earned       INTEGER NOT NULL DEFAULT 0,
  stars_earned    INTEGER NOT NULL DEFAULT 0,
  hints_used      INTEGER NOT NULL DEFAULT 0,
  answer_speed_ms INTEGER,
  risk_profile    TEXT,                          -- fast-risk-taker | cautious-learner | ...
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON sebo.game_sessions(user_id);
CREATE INDEX ON sebo.game_sessions(mission_id);

-- ─── Chat Messages (KI-Tutor) ─────────────────────────────────────────────────
CREATE TABLE sebo.chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON sebo.chat_messages(user_id, created_at);

-- tägliches Rate-Limit: max. 20 Nachrichten/Tag
CREATE TABLE sebo.chat_rate_limit (
  user_id    UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- ─── Blog Posts ───────────────────────────────────────────────────────────────
CREATE TABLE sebo.posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,                    -- Tiptap JSON oder HTML
  excerpt      TEXT,
  cover_image  TEXT,
  author_id    UUID REFERENCES sebo.users(id) ON DELETE SET NULL,
  published    BOOLEAN NOT NULL DEFAULT false,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON sebo.posts(published, created_at DESC);
CREATE INDEX ON sebo.posts(slug);

-- ─── Campaign Progress ────────────────────────────────────────────────────────
CREATE TABLE sebo.campaign_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES sebo.users(id) ON DELETE CASCADE,
  campaign_id  TEXT NOT NULL,
  step_index   INTEGER NOT NULL DEFAULT 0,
  choices      JSONB NOT NULL DEFAULT '{}',      -- {stepId: choiceId}
  completed    BOOLEAN NOT NULL DEFAULT false,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, campaign_id)
);

-- ─── Streak Trigger ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sebo.update_streak()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.last_active = CURRENT_DATE THEN
    RETURN NEW;
  END IF;
  IF NEW.last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    NEW.streak_days := NEW.streak_days + 1;
  ELSE
    NEW.streak_days := 1;
  END IF;
  NEW.last_active := CURRENT_DATE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_streak
  BEFORE UPDATE OF last_active ON sebo.users
  FOR EACH ROW EXECUTE FUNCTION sebo.update_streak();

-- ─── updated_at Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sebo.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON sebo.users
  FOR EACH ROW EXECUTE FUNCTION sebo.set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON sebo.posts
  FOR EACH ROW EXECUTE FUNCTION sebo.set_updated_at();
