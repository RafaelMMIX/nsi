-- Quiz en classe NSI Hub : à exécuter dans Supabase > SQL Editor.
-- Les réponses justes et les scores restent côté PostgreSQL.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.classroom_games (
  code text primary key,
  teacher_hash text not null,
  status text not null default 'waiting' check (status in ('waiting','playing','results','finished','cancelled')),
  quiz jsonb not null,
  question_index integer not null default -1,
  question_started_at timestamptz,
  question_ends_at timestamptz,
  duration_seconds integer not null default 20,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours'
);
create table if not exists public.classroom_players (
  game_code text not null references public.classroom_games(code) on delete cascade,
  token_hash text not null,
  nickname text not null,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (game_code, token_hash),
  unique (game_code, nickname)
);
alter table public.classroom_players add column if not exists last_seen_at timestamptz not null default now();
create table if not exists public.classroom_answers (
  game_code text not null references public.classroom_games(code) on delete cascade,
  question_index integer not null,
  token_hash text not null,
  answer_index integer not null check (answer_index between 0 and 3),
  received_at timestamptz not null default clock_timestamp(),
  points integer not null default 0,
  response_ms integer,
  primary key (game_code, question_index, token_hash)
);
alter table public.classroom_answers add column if not exists response_ms integer;
alter table public.classroom_games enable row level security;
alter table public.classroom_players enable row level security;
alter table public.classroom_answers enable row level security;
revoke all on public.classroom_games, public.classroom_players, public.classroom_answers from anon, authenticated;

create or replace function public.classroom_notify() returns trigger
language plpgsql security definer set search_path = '' as $$
declare game_code text;
begin
  if tg_op = 'DELETE' then
    game_code := coalesce(to_jsonb(old)->>'code', to_jsonb(old)->>'game_code');
  else
    game_code := coalesce(to_jsonb(new)->>'code', to_jsonb(new)->>'game_code');
  end if;
  perform realtime.send(jsonb_build_object('changed', true), 'change', 'classroom:' || game_code, true);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end; $$;
drop trigger if exists classroom_game_notify on public.classroom_games;
create trigger classroom_game_notify after insert or update on public.classroom_games for each row execute function public.classroom_notify();
drop trigger if exists classroom_player_notify on public.classroom_players;
create trigger classroom_player_notify after insert or update or delete on public.classroom_players for each row execute function public.classroom_notify();
drop trigger if exists classroom_answer_notify on public.classroom_answers;
create trigger classroom_answer_notify after insert or update on public.classroom_answers for each row execute function public.classroom_notify();
drop policy if exists "classroom public room broadcasts" on realtime.messages;
create policy "classroom public room broadcasts" on realtime.messages for select to anon using (realtime.topic() like 'classroom:%');

create or replace function public.classroom_code(p_code text) returns text
language sql immutable set search_path = '' as $$ select upper(regexp_replace(coalesce(p_code,''), '[^A-Za-z0-9-]', '', 'g')) $$;

create or replace function public.classroom_create(p_quiz jsonb, p_duration integer, p_teacher_secret text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c text; i integer; n integer;
begin
  if length(coalesce(p_teacher_secret,'')) < 32 or jsonb_typeof(p_quiz->'questions') <> 'array' or jsonb_array_length(p_quiz->'questions') < 1 then raise exception 'Données de quiz invalides'; end if;
  if coalesce(p_duration,20) not in (10,15,20,30,45,60,0) then raise exception 'Durée invalide'; end if;
  for i in 0..jsonb_array_length(p_quiz->'questions')-1 loop
    if jsonb_array_length(p_quiz->'questions'->i->'answers') <> 4 or (p_quiz->'questions'->i->>'correctAnswer')::integer not between 0 and 3 then raise exception 'Question invalide'; end if;
  end loop;
  for n in 1..10 loop
    c := 'NSI-' || upper(substr(encode(extensions.gen_random_bytes(4),'hex'),1,6));
    begin
      insert into public.classroom_games(code, teacher_hash, quiz, duration_seconds)
      values (c, encode(extensions.digest(p_teacher_secret,'sha256'),'hex'), p_quiz, coalesce(p_duration,20));
      return jsonb_build_object('code',c,'status','waiting');
    exception when unique_violation then null;
    end;
  end loop;
  raise exception 'Impossible de créer un code de partie';
end; $$;

create or replace function public.classroom_join(p_code text, p_nickname text, p_player_secret text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c text; g public.classroom_games%rowtype; nick text;
begin
  c := public.classroom_code(p_code); nick := btrim(p_nickname);
  if length(coalesce(p_player_secret,'')) < 32 or nick !~ '^[[:alnum:] _.-]{1,20}$' then raise exception 'Pseudo invalide'; end if;
  select * into g from public.classroom_games where code=c for update;
  if not found or g.expires_at < now() or g.status not in ('waiting','playing','results') then raise exception 'Partie introuvable ou terminée'; end if;
  if exists(select 1 from public.classroom_players where game_code=c and token_hash=encode(extensions.digest(p_player_secret,'sha256'),'hex')) then
    update public.classroom_players set last_seen_at=now() where game_code=c and token_hash=encode(extensions.digest(p_player_secret,'sha256'),'hex');
    return public.classroom_state(c,p_player_secret);
  end if;
  if g.status <> 'waiting' then raise exception 'La partie a déjà commencé'; end if;
  if exists(select 1 from public.classroom_players where game_code=c and lower(nickname)=lower(nick)) then raise exception 'Ce pseudo est déjà utilisé'; end if;
  insert into public.classroom_players(game_code,token_hash,nickname) values(c,encode(extensions.digest(p_player_secret,'sha256'),'hex'),nick);
  return public.classroom_state(c,p_player_secret);
end; $$;

create or replace function public.classroom_state(p_code text, p_player_secret text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c text; g public.classroom_games%rowtype; q jsonb; rankdata jsonb; n integer;
begin
  c := public.classroom_code(p_code);
  select * into g from public.classroom_games where code=c;
  if not found then raise exception 'Partie introuvable'; end if;
  if g.expires_at < now() and g.status <> 'finished' then update public.classroom_games set status='finished' where code=c returning * into g; end if;
  if g.question_index >= 0 and g.question_index < jsonb_array_length(g.quiz->'questions') then
    q := g.quiz->'questions'->g.question_index;
    q := q - 'correctAnswer' - 'explanation';
  else q := null; end if;
  select count(*) into n from public.classroom_players where game_code=c and last_seen_at>now()-interval '30 seconds';
  select coalesce(jsonb_agg(jsonb_build_object('nickname',p.nickname,'score',coalesce(s.score,0),'correct',coalesce(s.correct,0),'roundPoints',coalesce(s.round_points,0),'bestTimeMs',s.best_time_ms) order by coalesce(s.score,0) desc,p.nickname), '[]'::jsonb)
    into rankdata from public.classroom_players p left join lateral (select sum(a.points)::int score, count(*) filter(where a.points>0)::int correct, sum(a.points) filter(where a.question_index=g.question_index)::int round_points, min(a.response_ms) filter(where a.points>0) best_time_ms from public.classroom_answers a where a.game_code=c and a.token_hash=p.token_hash) s on true where p.game_code=c;
  return jsonb_build_object('code',c,'status',g.status,'quiz',jsonb_build_object('id',g.quiz->>'id','title',g.quiz->>'title','level',g.quiz->>'level','questionCount',jsonb_array_length(g.quiz->'questions')),'questionIndex',g.question_index,'question',q,'startedAt',g.question_started_at,'endsAt',g.question_ends_at,'duration',g.duration_seconds,'players',n,'roster',(select coalesce(jsonb_agg(nickname order by joined_at),'[]'::jsonb) from public.classroom_players where game_code=c and last_seen_at>now()-interval '30 seconds'),'answersReceived',(select count(*) from public.classroom_answers where game_code=c and question_index=g.question_index),'rankings',case when g.status in ('results','finished') then rankdata else '[]'::jsonb end,'myAnswer',(select answer_index from public.classroom_answers where game_code=c and question_index=g.question_index and token_hash=encode(extensions.digest(coalesce(p_player_secret,''),'sha256'),'hex')),'myNickname',(select nickname from public.classroom_players where game_code=c and token_hash=encode(extensions.digest(coalesce(p_player_secret,''),'sha256'),'hex')));
end; $$;

create or replace function public.classroom_ping(p_code text,p_player_secret text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  c:=public.classroom_code(p_code);
  update public.classroom_players set last_seen_at=now() where game_code=c and token_hash=encode(extensions.digest(coalesce(p_player_secret,''),'sha256'),'hex');
  return found;
end; $$;

create or replace function public.classroom_teacher_action(p_code text,p_secret text,p_action text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c text; g public.classroom_games%rowtype; correct integer; ix integer;
begin
  c:=public.classroom_code(p_code); select * into g from public.classroom_games where code=c for update;
  if not found or g.teacher_hash<>encode(extensions.digest(coalesce(p_secret,''),'sha256'),'hex') then raise exception 'Accès professeur refusé'; end if;
  if p_action='start' and g.status='waiting' then update public.classroom_games set status='playing',question_index=0,question_started_at=clock_timestamp(),question_ends_at=case when duration_seconds=0 then null else clock_timestamp()+make_interval(secs=>duration_seconds) end where code=c;
  elsif p_action='results' and g.status='playing' then
    ix:=g.question_index; correct:=(g.quiz->'questions'->ix->>'correctAnswer')::integer;
    with ranked as (select token_hash,rank() over(order by received_at) place from public.classroom_answers where game_code=c and question_index=ix and answer_index=correct)
    update public.classroom_answers a set points=greatest(10,110-(r.place::integer*10)), response_ms=greatest(0,(extract(epoch from (a.received_at-g.question_started_at))*1000)::integer) from ranked r where a.game_code=c and a.question_index=ix and a.token_hash=r.token_hash;
    update public.classroom_games set status='results' where code=c;
  elsif p_action='next' and g.status='results' then
    if g.question_index+1 >= jsonb_array_length(g.quiz->'questions') then update public.classroom_games set status='finished' where code=c;
    else update public.classroom_games set status='playing',question_index=question_index+1,question_started_at=clock_timestamp(),question_ends_at=case when duration_seconds=0 then null else clock_timestamp()+make_interval(secs=>duration_seconds) end where code=c; end if;
  elsif p_action='cancel' and g.status in ('waiting','playing','results') then update public.classroom_games set status='cancelled' where code=c;
  else raise exception 'Action impossible pour cet état'; end if;
  return public.classroom_state(c,'');
end; $$;

create or replace function public.classroom_submit(p_code text,p_player_secret text,p_answer integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c text; g public.classroom_games%rowtype; token text; received timestamptz;
begin
  c:=public.classroom_code(p_code); token:=encode(extensions.digest(coalesce(p_player_secret,''),'sha256'),'hex');
  select * into g from public.classroom_games where code=c for update;
  if not found or g.status<>'playing' or g.expires_at<now() then raise exception 'La question n’accepte plus de réponses'; end if;
  if g.question_ends_at is not null and clock_timestamp()>g.question_ends_at then raise exception 'Le temps est écoulé'; end if;
  if p_answer not between 0 and 3 or not exists(select 1 from public.classroom_players where game_code=c and token_hash=token) then raise exception 'Réponse invalide'; end if;
  received:=clock_timestamp();
  insert into public.classroom_answers(game_code,question_index,token_hash,answer_index,received_at) values(c,g.question_index,token,p_answer,received) on conflict do nothing;
  if not found then raise exception 'Réponse déjà enregistrée'; end if;
  return jsonb_build_object('accepted',true,'receivedAt',received);
end; $$;

revoke all on function public.classroom_create(jsonb,integer,text), public.classroom_join(text,text,text), public.classroom_state(text,text), public.classroom_ping(text,text), public.classroom_teacher_action(text,text,text), public.classroom_submit(text,text,integer) from public;
grant execute on function public.classroom_create(jsonb,integer,text), public.classroom_join(text,text,text), public.classroom_state(text,text), public.classroom_ping(text,text), public.classroom_teacher_action(text,text,text), public.classroom_submit(text,text,integer) to anon;
