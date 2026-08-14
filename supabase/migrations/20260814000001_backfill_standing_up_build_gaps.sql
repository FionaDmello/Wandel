-- One-time repair for issue #42: build-habit Standing Up records written
-- before the #42 fix could end up stale-wide (spanning a gap that a later
-- backfilled date should have split) because the old write-time logic only
-- ever looked backward from a newly-saved date, never forward.
--
-- Also cleans up leftover garbage from the mechanism #29 removed: before
-- that fix shipped (2026-08-13), tapping "I am returning" on a build habit
-- wrote a standing_up_log row directly from the tap timestamp, unrelated to
-- any real build_observations gap. #29's own cleanup migration
-- (20260813000000_standing_up_log_unique_fall_date.sql) only deleted that
-- garbage for the break track (gap_days = 0); build-track leftovers from
-- the same old mechanism were never touched.
--
-- This recomputes every real gap for every build habit directly from the
-- full build_observations history (using LAG to compare each date against
-- its immediate predecessor within the same habit), deletes any build-track
-- row that doesn't correspond to a currently-real gap, then upserts the
-- correct fall_date/return_date/gap_days for each real one — using the
-- existing (habit_id, fall_date) unique index from the #29 follow-up
-- migration to both correct stale-wide rows in place and insert any
-- narrower rows that were never created at all.
--
-- Safe to re-run: every row this produces is fully re-derived from
-- build_observations, not from prior standing_up_log state.

-- Step 1: remove build-track rows that don't match any currently-real gap
-- (old "I am returning" leftovers, or anything else with no basis in the
-- actual observation history).
with ordered_obs as (
  select
    habit_id,
    date,
    lag(date) over (partition by habit_id order by date) as prev_date
  from build_observations
),
correct_gaps as (
  select
    habit_id,
    prev_date + 1 as fall_date
  from ordered_obs
  where prev_date is not null and date - prev_date > 1
)
delete from standing_up_log s
where s.track_type = 'build'
  and not exists (
    select 1
    from correct_gaps g
    where g.habit_id = s.habit_id and g.fall_date = s.fall_date
  );

-- Step 2: upsert the correct set of gaps.
with ordered_obs as (
  select
    user_id,
    habit_id,
    date,
    lag(date) over (partition by habit_id order by date) as prev_date
  from build_observations
),
gaps as (
  select
    user_id,
    habit_id,
    prev_date + 1 as fall_date,
    date as return_date,
    (date - prev_date - 1) as gap_days
  from ordered_obs
  where prev_date is not null and date - prev_date > 1
)
insert into standing_up_log (
  user_id, habit_id, track_type, track_name, protocol, fall_date, return_date, gap_days
)
select
  g.user_id,
  g.habit_id,
  'build',
  h.name,
  case when g.gap_days = 1 then 'slip' else 'drift' end,
  g.fall_date,
  g.return_date,
  g.gap_days
from gaps g
join habits h on h.id = g.habit_id
on conflict (habit_id, fall_date) where habit_id is not null
do update set
  return_date = excluded.return_date,
  gap_days = excluded.gap_days,
  protocol = excluded.protocol,
  track_name = excluded.track_name;
