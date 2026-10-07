-- Prima esperienza nuova: progetto anonimo e note separate. Nessun accesso diretto dal browser.
create table public.bussola_v2_partecipanti (
 id uuid primary key default gen_random_uuid(),
 token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '30 days')
);
create table public.bussola_v2_progetti (
 partecipante_id uuid not null references public.bussola_v2_partecipanti(id) on delete cascade,
 corso text not null check (corso in ('ssas','afm','sia','turismo','cat')),
 versione integer not null default 1 check (versione>0),
 payload jsonb not null check (jsonb_typeof(payload)='object' and octet_length(payload::text)<=40000),
 revision integer not null default 1 check (revision>0),
 updated_at timestamptz not null default now(),
 primary key (partecipante_id,corso)
);
create table public.bussola_v2_note (
 id uuid primary key,
 partecipante_id uuid not null references public.bussola_v2_partecipanti(id) on delete cascade,
 corso text not null check (corso in ('ssas','afm','sia','turismo','cat')),
 passaggio integer not null check (passaggio between 0 and 5),
 contesto text not null check (char_length(contesto) between 1 and 240),
 versione integer not null check (versione>0),
 ruolo_dichiarato text not null check (ruolo_dichiarato in ('alunno','docente')),
 tipo text not null check (tipo in ('chiarezza','problema','idea','piaciuto')),
 testo text not null check (char_length(testo) between 2 and 2000),
 created_at timestamptz not null default now()
);
create index bussola_v2_note_partecipante on public.bussola_v2_note(partecipante_id,created_at);
create table public.bussola_v2_quote (
 fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
 giorno date not null default current_date,
 richieste integer not null default 1,
 primary key (fingerprint,giorno)
);
alter table public.bussola_v2_partecipanti enable row level security;
alter table public.bussola_v2_progetti enable row level security;
alter table public.bussola_v2_note enable row level security;
alter table public.bussola_v2_quote enable row level security;
revoke all on public.bussola_v2_partecipanti,public.bussola_v2_progetti,public.bussola_v2_note,public.bussola_v2_quote from public,anon,authenticated;
grant select,insert,update,delete on public.bussola_v2_partecipanti,public.bussola_v2_progetti,public.bussola_v2_note,public.bussola_v2_quote to service_role;
comment on table public.bussola_v2_partecipanti is 'Accessi anonimi alla prova Bussola: hash di token casuali, senza nomi. Classi e attestati nominativi non ancora attivati.';
comment on table public.bussola_v2_note is 'Ogni nota ha una riga autonoma. Il ruolo dichiarato descrive chi prova: non assegna alcun privilegio.';
create function public.bussola_v2_quota(p_fingerprint text) returns boolean
language sql security invoker set search_path='' as $$
 insert into public.bussola_v2_quote(fingerprint,giorno,richieste) values(p_fingerprint,current_date,1)
 on conflict(fingerprint,giorno) do update set richieste=public.bussola_v2_quote.richieste+1
 returning richieste<=200;
$$;
create function public.bussola_v2_salva(p_partecipante uuid,p_corso text,p_payload jsonb,p_revision integer)
returns integer language plpgsql security invoker set search_path='' as $$
declare r integer;
begin
 if p_revision=0 then
   insert into public.bussola_v2_progetti(partecipante_id,corso,payload) values(p_partecipante,p_corso,p_payload)
   on conflict do nothing returning revision into r;
 else
   update public.bussola_v2_progetti set payload=payload||p_payload, revision=revision+1, updated_at=now()
   where partecipante_id=p_partecipante and corso=p_corso and revision=p_revision returning revision into r;
 end if;
 return r;
end;
$$;
revoke execute on function public.bussola_v2_quota(text),public.bussola_v2_salva(uuid,text,jsonb,integer) from public,anon,authenticated;
grant execute on function public.bussola_v2_quota(text),public.bussola_v2_salva(uuid,text,jsonb,integer) to service_role;
