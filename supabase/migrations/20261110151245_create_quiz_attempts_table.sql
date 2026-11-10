/*
# Create quiz_attempts table (anonymous, insert-only)

1. New Tables
- `quiz_attempts`
  - `id` (uuid, primary key)
  - `total_questions` (integer, 1-100)
  - `correct_answers` (integer, 0 up to total_questions)
  - `score` (integer, points earned, not negative)
  - `accuracy` (integer, percent 0-100)
  - `rank_code` (text, short rank identifier, e.g. "novice")
  - `duration_seconds` (integer, time spent, not negative)
  - `created_at` (timestamptz, defaults to now)
2. Security
- Row level security enabled.
- The app has no sign-in, so the anon role may only INSERT rows. There is no SELECT grant, so stored attempts cannot be read back through the public API.
- No personal data is stored.
3. Notes
- Idempotent: safe to re-run.
*/

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_questions integer NOT NULL CHECK (total_questions BETWEEN 1 AND 100),
  correct_answers integer NOT NULL CHECK (correct_answers >= 0 AND correct_answers <= total_questions),
  score integer NOT NULL CHECK (score >= 0),
  accuracy integer NOT NULL CHECK (accuracy BETWEEN 0 AND 100),
  rank_code text NOT NULL CHECK (char_length(rank_code) BETWEEN 1 AND 40),
  duration_seconds integer NOT NULL CHECK (duration_seconds >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON quiz_attempts TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_quiz_attempts" ON quiz_attempts;
CREATE POLICY "anon_insert_quiz_attempts" ON quiz_attempts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
