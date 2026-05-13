-- ============================================================
-- AI Fluency — Full Schema Migration
-- Run against a fresh Supabase project.
-- ============================================================

-- ─── Extensions ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL,
  display_name        TEXT NOT NULL DEFAULT '',
  avatar_url          TEXT,
  role                TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'org_admin')),
  xp_total            INT  NOT NULL DEFAULT 0,
  level               INT  NOT NULL DEFAULT 1,
  current_streak      INT  NOT NULL DEFAULT 0,
  longest_streak      INT  NOT NULL DEFAULT 0,
  streak_freezes      INT  NOT NULL DEFAULT 2,
  last_lesson_at      TIMESTAMPTZ,
  skill_level         TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  plan                TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  org_id              UUID,  -- FK added after organizations table
  preferences         JSONB NOT NULL DEFAULT '{"notifications": true, "dark_mode": false, "leaderboard_visible": false}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ─── ORGANIZATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  logo_url     TEXT,
  plan         TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  max_seats    INT  NOT NULL DEFAULT 10,
  custom_tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by   UUID REFERENCES public.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Org admins and owners can read their org
CREATE POLICY "Org members can read their org"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Org admins can update their org"
  ON public.organizations FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND status = 'active'
    )
  );

-- Add org FK to users now that organizations exists
ALTER TABLE public.users
  ADD CONSTRAINT fk_users_org FOREIGN KEY (org_id) REFERENCES public.organizations(id);

-- ─── ORG MEMBERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.org_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at   TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'deactivated')),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can read members"
  ON public.org_members FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND status = 'active'
    )
  );

CREATE POLICY "Users can read own membership"
  ON public.org_members FOR SELECT
  USING (user_id = auth.uid());

-- ─── ORG INVITES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.org_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email       TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

-- Org admins can manage invites; anyone can read (to validate an invite link)
CREATE POLICY "Anyone can read invite by code"
  ON public.org_invites FOR SELECT
  USING (true);

CREATE POLICY "Org admins can insert invites"
  ON public.org_invites FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND status = 'active'
    )
  );

-- ─── SUBSCRIPTIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan                   TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_subscriptions_user           ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- ─── LESSON PROGRESS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id            TEXT NOT NULL,
  track_id             TEXT NOT NULL,
  stream               TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  score                INT,
  max_score            INT NOT NULL DEFAULT 100,
  attempts             INT NOT NULL DEFAULT 0,
  time_spent_seconds   INT NOT NULL DEFAULT 0,
  first_attempted_at   TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own lesson progress"
  ON public.lesson_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own lesson progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own lesson progress"
  ON public.lesson_progress FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user   ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_track  ON public.lesson_progress(track_id);

-- ─── EXERCISE SUBMISSIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercise_submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id         TEXT NOT NULL,
  exercise_index    INT  NOT NULL,
  exercise_type     TEXT NOT NULL,
  user_input        TEXT NOT NULL,
  ai_feedback       JSONB,
  score             INT  NOT NULL DEFAULT 0,
  max_score         INT  NOT NULL DEFAULT 3,
  grading_latency_ms INT,
  attempt_number    INT  NOT NULL DEFAULT 1,
  is_review         BOOLEAN NOT NULL DEFAULT false,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exercise_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own submissions"
  ON public.exercise_submissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own submissions"
  ON public.exercise_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_submissions_user   ON public.exercise_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_lesson ON public.exercise_submissions(lesson_id);

-- ─── DAILY ACTIVITY ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date                DATE NOT NULL,
  xp_earned           INT  NOT NULL DEFAULT 0,
  lessons_completed   INT  NOT NULL DEFAULT 0,
  reviews_completed   INT  NOT NULL DEFAULT 0,
  time_spent_minutes  INT  NOT NULL DEFAULT 0,
  streak_maintained   BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily activity"
  ON public.daily_activity FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own daily activity"
  ON public.daily_activity FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own daily activity"
  ON public.daily_activity FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, date);

-- ─── REVIEW SCHEDULE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.review_schedule (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id       TEXT NOT NULL,
  exercise_index  INT  NOT NULL,
  strength        INT  NOT NULL DEFAULT 50 CHECK (strength BETWEEN 0 AND 100),
  next_review_at  DATE NOT NULL,
  last_reviewed_at DATE,
  interval_days   INT  NOT NULL DEFAULT 1,
  times_reviewed  INT  NOT NULL DEFAULT 0,
  UNIQUE(user_id, lesson_id, exercise_index)
);

ALTER TABLE public.review_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own review schedule"
  ON public.review_schedule FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own review schedule"
  ON public.review_schedule FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own review schedule"
  ON public.review_schedule FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_review_schedule_user_due ON public.review_schedule(user_id, next_review_at);

-- ─── PLAYGROUND USAGE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playground_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_text     TEXT NOT NULL,
  response_text   TEXT NOT NULL,
  prompt_tokens   INT,
  response_tokens INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.playground_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playground usage"
  ON public.playground_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own playground usage"
  ON public.playground_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_playground_usage_user_date ON public.playground_usage(user_id, created_at);

-- ─── ACHIEVEMENTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.achievements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON public.achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ─── TRIGGERS ──────────────────────────────────────────────

-- Auto-update updated_at on users
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile + free subscription on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── SERVICE ROLE BYPASS ───────────────────────────────────
-- Allow service role (used in webhook handler) to bypass RLS for subscriptions
CREATE POLICY "Service role can do anything on subscriptions"
  ON public.subscriptions
  USING (true)
  WITH CHECK (true);
