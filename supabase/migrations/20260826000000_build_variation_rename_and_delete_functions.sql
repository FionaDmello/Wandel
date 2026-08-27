-- Fixes: renaming a build habit variation didn't cascade to
-- habit_configs/build_observations, and deleting a variation never
-- cleaned up its build_observations at all (orphaning history).
-- Both are now atomic RPCs; a partial unique index stops two
-- variations from ever sharing a name; a one-time backfill cleans up
-- observations already orphaned by the pre-existing delete bug.

-- 1. De-duplicate any variations that already share a name before adding
-- the uniqueness constraint below. No DB-level uniqueness existed before
-- this migration (only a racy client-side check on add), so a stale
-- duplicate here would otherwise abort the whole migration, including
-- the functions and backfill below. Keeps the earliest-created row per
-- (habit_id, sub_type, key), tie-broken on id for a strict total order.
delete from habit_configs hc
using habit_configs hc2
where hc.habit_id = hc2.habit_id
  and hc.sub_type is not distinct from hc2.sub_type
  and hc.sub_type is not null
  and hc.key = hc2.key
  and (hc.created_at, hc.id) > (hc2.created_at, hc2.id);

-- 2. Prevent two variations (or a rename racing an add) from sharing a name.
create unique index habit_configs_unique_named_variation
  on habit_configs (habit_id, sub_type, key)
  where sub_type is not null;

-- 3. Atomic rename: updates habit_configs (name + values) and
-- build_observations (name) for the same variation in one transaction.
-- `security invoker` (the default) means this runs under the calling
-- user's own permissions — existing RLS policies on habit_configs and
-- build_observations apply exactly as they would to a direct write.
create or replace function rename_build_variation(
  p_habit_id uuid,
  p_old_sub_type text,
  p_new_sub_type text,
  p_anchor text,
  p_non_negotiable text,
  p_minimum_version text,
  p_full_version text
) returns void
language plpgsql
as $$
declare
  v_count integer;
begin
  update habit_configs
  set sub_type = p_new_sub_type,
      value = case key
        when 'anchor' then p_anchor
        when 'non_negotiable' then p_non_negotiable
        when 'minimum_version' then p_minimum_version
        when 'full_version' then p_full_version
        else value
      end
  where habit_id = p_habit_id
    and sub_type is not distinct from p_old_sub_type
    and key in ('anchor', 'non_negotiable', 'minimum_version', 'full_version');

  get diagnostics v_count = row_count;
  if v_count = 0 then
    raise exception 'No config rows found for habit % / sub_type %', p_habit_id, p_old_sub_type;
  end if;

  update build_observations
  set sub_type = p_new_sub_type
  where habit_id = p_habit_id
    and sub_type is not distinct from p_old_sub_type;
end;
$$;

-- 4. Atomic delete: removes a variation's config rows and its
-- observations together, closing the pre-existing orphaning bug.
create or replace function delete_build_variation(
  p_habit_id uuid,
  p_sub_type text
) returns void
language plpgsql
as $$
begin
  delete from build_observations
  where habit_id = p_habit_id and sub_type = p_sub_type;

  delete from habit_configs
  where habit_id = p_habit_id and sub_type = p_sub_type;
end;
$$;

-- 5. One-time cleanup of observations already orphaned by the
-- pre-existing delete bug, before it's fixed going forward.
delete from build_observations bo
where bo.sub_type is not null
  and not exists (
    select 1 from habit_configs hc
    where hc.habit_id = bo.habit_id
      and hc.sub_type = bo.sub_type
  );
