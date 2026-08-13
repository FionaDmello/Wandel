-- Remove same-day break-track entries created by the pre-fix HabitSlipModal
-- write, which unconditionally set gap_days = 0 / fall_date = return_date
-- the instant a slip was acknowledged. The current logic can never produce
-- gap_days = 0 (a Standing Up record always represents at least one real
-- elapsed day), so any row with gap_days = 0 is unambiguously stale.
delete from standing_up_log
where track_type = 'break' and gap_days = 0;

-- Prevent duplicate resolutions for the same habit/fall episode at the DB
-- level, closing the select-then-insert race in useSyncBreakStandingUp and
-- useUpsertBuildObservation.
create unique index standing_up_log_habit_fall_date
  on standing_up_log (habit_id, fall_date)
  where habit_id is not null;
