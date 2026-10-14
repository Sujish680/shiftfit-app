-- ShiftFit — Supabase database setup
-- Safe to run repeatedly (IF NOT EXISTS for tables/indexes,
-- DO-block guards for RLS policies).

-- ══════════════════════════════════════════════════════════════════════
-- TABLES
-- Column mapping from frontend camelCase:
--   startTime -> start_time,  endTime -> end_time,  dueDate -> due_date
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.classes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    day        TEXT        NOT NULL,
    start_time TIME        NOT NULL,
    end_time   TIME        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessments (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    due_date   DATE        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_blocks (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day        TEXT        NOT NULL,
    start_time TIME        NOT NULL,
    end_time   TIME        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.work_shifts (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employer   TEXT        NOT NULL,
    date       DATE        NOT NULL,
    start_time TIME        NOT NULL,
    end_time   TIME        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_classes_user_id      ON public.classes(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id  ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_study_blocks_user_id ON public.study_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_work_shifts_user_id  ON public.work_shifts(user_id);

-- ══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE public.classes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_shifts  ENABLE ROW LEVEL SECURITY;

-- ── classes policies ───────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own classes' AND tablename = 'classes') THEN
    CREATE POLICY "Users can view own classes"   ON public.classes FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own classes' AND tablename = 'classes') THEN
    CREATE POLICY "Users can insert own classes" ON public.classes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own classes' AND tablename = 'classes') THEN
    CREATE POLICY "Users can update own classes" ON public.classes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own classes' AND tablename = 'classes') THEN
    CREATE POLICY "Users can delete own classes" ON public.classes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── assessments policies ───────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own assessments' AND tablename = 'assessments') THEN
    CREATE POLICY "Users can view own assessments"   ON public.assessments FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own assessments' AND tablename = 'assessments') THEN
    CREATE POLICY "Users can insert own assessments" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own assessments' AND tablename = 'assessments') THEN
    CREATE POLICY "Users can update own assessments" ON public.assessments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own assessments' AND tablename = 'assessments') THEN
    CREATE POLICY "Users can delete own assessments" ON public.assessments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── study_blocks policies ──────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own study blocks' AND tablename = 'study_blocks') THEN
    CREATE POLICY "Users can view own study blocks"   ON public.study_blocks FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own study blocks' AND tablename = 'study_blocks') THEN
    CREATE POLICY "Users can insert own study blocks" ON public.study_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own study blocks' AND tablename = 'study_blocks') THEN
    CREATE POLICY "Users can update own study blocks" ON public.study_blocks FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own study blocks' AND tablename = 'study_blocks') THEN
    CREATE POLICY "Users can delete own study blocks" ON public.study_blocks FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── work_shifts policies ───────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own work shifts' AND tablename = 'work_shifts') THEN
    CREATE POLICY "Users can view own work shifts"   ON public.work_shifts FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own work shifts' AND tablename = 'work_shifts') THEN
    CREATE POLICY "Users can insert own work shifts" ON public.work_shifts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own work shifts' AND tablename = 'work_shifts') THEN
    CREATE POLICY "Users can update own work shifts" ON public.work_shifts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own work shifts' AND tablename = 'work_shifts') THEN
    CREATE POLICY "Users can delete own work shifts" ON public.work_shifts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;