-- Fixes: security audit (#14) finding — handle_new_user() and
-- rls_auto_enable() are trigger/event-trigger functions, so Postgres
-- already blocks any direct call (including via PostgREST's
-- /rest/v1/rpc/ endpoint) with "trigger functions can only be called
-- as triggers" — confirmed no real exploit path. This just silences
-- the linter noise for defense-in-depth: revoking EXECUTE from
-- anon/authenticated has no effect on either function's real job,
-- since triggers and event triggers fire independent of EXECUTE
-- privilege grants.
revoke execute on function handle_new_user() from anon, authenticated;
revoke execute on function rls_auto_enable() from anon, authenticated;
