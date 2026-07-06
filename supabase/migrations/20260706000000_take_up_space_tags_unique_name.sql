-- Remove duplicate tags, keeping the earliest row per (user_id, name).
-- These duplicates were caused by the seed firing before the initial query
-- resolved, so tags.length === 0 was true while loading, not just when empty.
delete from take_up_space_tags
where id not in (
  select distinct on (user_id, name) id
  from take_up_space_tags
  order by user_id, name, created_at asc
);

-- Prevent duplicates at the DB level going forward.
create unique index take_up_space_tags_user_name
  on take_up_space_tags (user_id, name);
