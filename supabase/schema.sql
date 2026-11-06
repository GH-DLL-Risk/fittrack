-- FitTrack team backend for Supabase. Run once in the project's SQL editor.
--
-- Privacy model: the server only stores team membership, nicknames and the summary numbers each
-- person chooses to share (e.g. "best bench press est. 1RM this week"). Personal logs never leave the phone.
-- Access model: the tables have row level security on and NO policies, so they cannot be read or written
-- directly through the API. Every operation goes through the functions below, which check membership.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,   -- one team per person
  team_id uuid not null references public.teams(id) on delete cascade,
  nickname text not null check (nickname ~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{1,19}$'),
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now()
);
create unique index if not exists members_team_nickname on public.members (team_id, lower(nickname));
create index if not exists members_team on public.members (team_id);

create table if not exists public.scores (
  user_id uuid not null references public.members(user_id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  metric text not null,
  period text not null,
  value double precision not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, metric, period)
);
create index if not exists scores_lookup on public.scores (team_id, metric, period);

alter table public.teams enable row level security;
alter table public.members enable row level security;
alter table public.scores enable row level security;
revoke all on public.teams, public.members, public.scores from anon, authenticated;

-- ---------- helpers ----------

create or replace function public._my_team() returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from members where user_id = auth.uid()
$$;

create or replace function public._new_code() returns text
language sql volatile set search_path = public, extensions as $$
  select upper(encode(extensions.gen_random_bytes(5), 'hex'))   -- 10 hex characters, 40 bits
$$;

create or replace function public._check_nickname(p text) returns text
language plpgsql immutable as $$
begin
  p := btrim(coalesce(p, ''));
  if p !~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{1,19}$' then
    raise exception 'Nickname: 2–20 letters, numbers, spaces, dots, dashes or underscores';
  end if;
  return p;
end $$;

-- ---------- team membership ----------

create or replace function public.my_team() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', t.id, 'name', t.name, 'invite_code', t.invite_code, 'me', m.user_id, 'role', m.role, 'nickname', m.nickname,
    'members', (select json_agg(json_build_object('user_id', x.user_id, 'nickname', x.nickname, 'role', x.role) order by x.joined_at)
                from members x where x.team_id = t.id))
  from members m join teams t on t.id = m.team_id
  where m.user_id = auth.uid()
$$;

create or replace function public.create_team(p_name text, p_nickname text) returns json
language plpgsql security definer set search_path = public as $$
declare v_team uuid; v_nick text := _check_nickname(p_nickname);
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from members where user_id = auth.uid()) then raise exception 'You are already in a team'; end if;
  if char_length(btrim(coalesce(p_name, ''))) not between 1 and 40 then raise exception 'Team name: 1–40 characters'; end if;
  insert into teams (name, invite_code) values (btrim(p_name), _new_code()) returning id into v_team;
  insert into members (user_id, team_id, nickname, role) values (auth.uid(), v_team, v_nick, 'owner');
  return my_team();
end $$;

create or replace function public.join_team(p_code text, p_nickname text) returns json
language plpgsql security definer set search_path = public as $$
declare v_team uuid; v_nick text := _check_nickname(p_nickname);
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from members where user_id = auth.uid()) then raise exception 'You are already in a team'; end if;
  select id into v_team from teams where invite_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if v_team is null then raise exception 'Invite code not found'; end if;
  if (select count(*) from members where team_id = v_team) >= 50 then raise exception 'This team is full (50 members)'; end if;
  begin
    insert into members (user_id, team_id, nickname) values (auth.uid(), v_team, v_nick);
  exception when unique_violation then
    raise exception 'That nickname is already taken in this team';
  end;
  return my_team();
end $$;

create or replace function public.set_nickname(p_nickname text) returns json
language plpgsql security definer set search_path = public as $$
declare v_nick text := _check_nickname(p_nickname);
begin
  begin
    update members set nickname = v_nick where user_id = auth.uid();
  exception when unique_violation then
    raise exception 'That nickname is already taken in this team';
  end;
  return my_team();
end $$;

create or replace function public.new_invite_code() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from members where user_id = auth.uid() and role = 'owner') then raise exception 'Only the team owner can do this'; end if;
  update teams set invite_code = _new_code() where id = _my_team();
  return my_team();
end $$;

create or replace function public.remove_member(p_user uuid) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from members where user_id = auth.uid() and role = 'owner') then raise exception 'Only the team owner can do this'; end if;
  if p_user = auth.uid() then raise exception 'Use "Leave team" to remove yourself'; end if;
  delete from members where user_id = p_user and team_id = _my_team();
  return my_team();
end $$;

-- Leaving deletes your membership and shared scores. If the owner leaves, the longest-standing member
-- becomes owner; an empty team is deleted.
create or replace function public.leave_team() returns void
language plpgsql security definer set search_path = public as $$
declare v_team uuid; v_role text;
begin
  select team_id, role into v_team, v_role from members where user_id = auth.uid();
  if v_team is null then return; end if;
  delete from members where user_id = auth.uid();
  if v_role = 'owner' then
    update members set role = 'owner'
      where user_id = (select user_id from members where team_id = v_team order by joined_at limit 1);
    delete from teams where id = v_team and not exists (select 1 from members where team_id = v_team);
  end if;
end $$;

-- Removes everything the server knows about you, including the anonymous account itself.
create or replace function public.delete_me() returns void
language plpgsql security definer set search_path = public as $$
begin
  perform leave_team();
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- scores ----------

-- Replaces all of your shared numbers with the given set: [{"m": metric, "p": period, "v": value}, ...]
create or replace function public.replace_my_scores(p_rows jsonb) returns integer
language plpgsql security definer set search_path = public as $$
declare v_team uuid := _my_team(); r jsonb; v double precision; m text; n integer := 0; ok boolean;
begin
  if v_team is null then raise exception 'Not in a team'; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 2000 then raise exception 'Invalid score list'; end if;
  delete from scores where user_id = auth.uid();
  for r in select * from jsonb_array_elements(p_rows) loop
    m := r->>'m';
    if jsonb_typeof(r->'v') <> 'number'
       or m !~ '^(ex:s-[a-z0-9-]{1,80}:(1rm|vol)|goal:(kg|bf)|kcal:(out|in|adh))$'
       or (r->>'p') !~ '^(w[0-9]{4}-[0-9]{2}-[0-9]{2}|m[0-9]{4}-[0-9]{2}|all)$' then
      raise exception 'Invalid score row';
    end if;
    v := (r->>'v')::double precision;
    -- assigned first: inside IF ... THEN, the THENs of a CASE would end the condition early
    ok := case
      when m like '%:1rm' then v between 0 and 600
      when m like '%:vol' then v between 0 and 5000000
      when m like 'goal:%' then v between -1000 and 1000
      when m = 'kcal:out' then v between 0 and 10000
      when m = 'kcal:in' then v between 0 and 15000
      else v between 0 and 1000 end;
    if not ok then
      raise exception 'Score out of range';
    end if;
    insert into scores (user_id, team_id, metric, period, value) values (auth.uid(), v_team, m, r->>'p', v)
      on conflict (user_id, metric, period) do update set value = excluded.value, updated_at = now();
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.team_scores(p_metric text, p_period text)
returns table (user_id uuid, nickname text, value double precision, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.user_id, m.nickname, s.value, s.updated_at
  from scores s join members m on m.user_id = s.user_id
  where s.team_id = _my_team() and s.metric = p_metric and s.period = p_period
$$;

create or replace function public.team_metrics() returns setof text
language sql stable security definer set search_path = public as $$
  select distinct metric from scores where team_id = _my_team()
$$;

-- ---------- permissions: only signed-in (incl. anonymous) users may call the public functions ----------

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.my_team(), public.create_team(text, text), public.join_team(text, text), public.set_nickname(text),
  public.new_invite_code(), public.remove_member(uuid), public.leave_team(), public.delete_me(),
  public.replace_my_scores(jsonb), public.team_scores(text, text), public.team_metrics()
to authenticated;
