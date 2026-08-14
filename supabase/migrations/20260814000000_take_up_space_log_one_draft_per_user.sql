-- Defensive cleanup: keep only the most recent draft per user, in case a
-- pre-fix race already created duplicates before this constraint existed.
-- Tie-broken on id (not just created_at): two drafts created in the same
-- race this migration defends against can land on the same timestamp, and
-- a created_at-only comparison would then delete neither, leaving the
-- duplicate in place and making the CREATE UNIQUE INDEX below fail outright.
DELETE FROM take_up_space_log a
USING take_up_space_log b
WHERE a.status = 'draft'
  AND b.status = 'draft'
  AND a.user_id = b.user_id
  AND (a.created_at, a.id) < (b.created_at, b.id);

CREATE UNIQUE INDEX IF NOT EXISTS take_up_space_log_one_draft_per_user
  ON take_up_space_log (user_id)
  WHERE status = 'draft';
