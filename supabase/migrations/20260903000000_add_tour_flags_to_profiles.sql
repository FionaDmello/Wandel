alter table profiles
  add column tour_completed boolean not null default false,
  add column habit_intro_seen boolean not null default false;
