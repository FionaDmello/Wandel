-- Fixes: security audit (#14) finding — update_updated_at,
-- rename_build_variation, and delete_build_variation all had a mutable
-- search_path, a known Postgres hardening gap (an unpinned search_path
-- resolves unqualified names using the caller's session search_path).
-- None of these three are security definer, so real-world risk was low,
-- but this is a zero-risk, recommended hardening.

-- update_updated_at only touches NEW/OLD record fields, no table
-- lookups — safe to pin with no body change.
alter function update_updated_at() set search_path = '';

-- rename_build_variation/delete_build_variation reference
-- habit_configs/build_observations unqualified, so pinning search_path
-- to '' requires schema-qualifying those references too, or the
-- functions would break on next call.
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
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.habit_configs
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

  update public.build_observations
  set sub_type = p_new_sub_type
  where habit_id = p_habit_id
    and sub_type is not distinct from p_old_sub_type;
end;
$$;

create or replace function delete_build_variation(
  p_habit_id uuid,
  p_sub_type text
) returns void
language plpgsql
set search_path = ''
as $$
begin
  delete from public.build_observations
  where habit_id = p_habit_id and sub_type = p_sub_type;

  delete from public.habit_configs
  where habit_id = p_habit_id and sub_type = p_sub_type;
end;
$$;
