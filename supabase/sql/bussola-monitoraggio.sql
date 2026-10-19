-- Intervento additivo. Eseguire prima delle nuove funzioni Edge; nessuna password o dato di prova.
begin;
alter table public.bussola_v2_classi add column prova boolean not null default false;
create table public.bussola_v2_classi_sessione (
 token_hash text not null references public.orientamento_sessioni(token_hash) on delete cascade,
 classe_id uuid not null references public.bussola_v2_classi(id),
 primary key(token_hash,classe_id)
);
alter table public.bussola_v2_classi_sessione enable row level security;
revoke all on public.bussola_v2_classi_sessione from public,anon,authenticated,service_role;
grant select,insert,delete on public.bussola_v2_classi_sessione to service_role;
create function public.bussola_v2_classe_commissione(p_sessione text,p_codice text,p_crea jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare c public.bussola_v2_classi;
begin
 if not exists(select 1 from public.orientamento_sessioni where token_hash=p_sessione and access_level='orientatore' and expires_at>now()) then return null; end if;
 if p_crea is null then
  select * into c from public.bussola_v2_classi where codice_breve=p_codice and attiva;
  if not found then return null; end if;
 else
  insert into public.bussola_v2_classi(id,codice,scuola,comune,classe,anno,modalita,prova)
  values((p_crea->>'id')::uuid,p_crea->>'codice',p_crea->>'scuola',p_crea->>'comune',p_crea->>'classe',p_crea->>'anno','nomi',coalesce((p_crea->>'prova')::boolean,false)) returning * into c;
 end if;
 insert into public.bussola_v2_classi_sessione(token_hash,classe_id) values(p_sessione,c.id) on conflict do nothing;
 return to_jsonb(c);
end; $$;
revoke all on function public.bussola_v2_classe_commissione(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.bussola_v2_classe_commissione(text,text,jsonb) to service_role;
create table public.bussola_v2_docenti (
 id uuid primary key default gen_random_uuid(),
 nome text not null check(char_length(nome) between 2 and 100),
 accesso text not null unique check(accesso ~ '^[a-z0-9][a-z0-9._-]{2,39}$'),
 password_hash text not null check(password_hash ~ '^[a-f0-9]{64}$'),
 salt text not null check(char_length(salt)=43),
 auth_version uuid not null default gen_random_uuid(),
 corsi text[] not null check(cardinality(corsi) between 1 and 5 and corsi <@ array['ssas','afm','sia','turismo','cat']::text[]),
 classi uuid[] not null default '{}' check(cardinality(classi)<=100),
 attivo boolean not null default true,
 updated_at timestamptz not null default now()
);
create table public.bussola_v2_sessioni_docenti (
 token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'),
 docente_id uuid not null references public.bussola_v2_docenti(id),
 auth_version uuid not null,
 expires_at timestamptz not null
);
create index bussola_sessioni_scadenza on public.bussola_v2_sessioni_docenti(expires_at);
create table public.bussola_v2_tentativi_docenti (
 fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'),
 finestra timestamptz not null,
 tentativi integer not null default 1,
 primary key(fingerprint,finestra)
);
create table public.bussola_v2_questionari (
 partecipante_id uuid primary key references public.bussola_v2_partecipanti(id),
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=12000),
 revision integer not null default 1,
 updated_at timestamptz not null default now()
);
create table public.bussola_v2_revisioni (
 id uuid primary key default gen_random_uuid(),
 partecipante_id uuid not null references public.bussola_v2_partecipanti(id),
 corso text not null check(corso in ('ssas','afm','sia','turismo','cat','bussola')),
 revision integer not null,
 tipo text not null,
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 unique(partecipante_id,corso,revision,tipo)
);
create index bussola_revisioni_proprietario on public.bussola_v2_revisioni(partecipante_id,corso,created_at);
create table public.bussola_v2_segnalazioni_docenti (
 id uuid primary key,
 docente_id uuid references public.bussola_v2_docenti(id),
 sessione_hash text,
 corso text not null check(corso in ('ssas','afm','sia','turismo','cat','bussola')),
 contesto text not null check(char_length(contesto) between 1 and 160),
 testo text not null check(char_length(testo) between 2 and 2000),
 created_at timestamptz not null default now()
);
alter table public.bussola_v2_docenti enable row level security;
alter table public.bussola_v2_sessioni_docenti enable row level security;
alter table public.bussola_v2_tentativi_docenti enable row level security;
alter table public.bussola_v2_questionari enable row level security;
alter table public.bussola_v2_revisioni enable row level security;
alter table public.bussola_v2_segnalazioni_docenti enable row level security;
revoke all on public.bussola_v2_docenti,public.bussola_v2_sessioni_docenti,public.bussola_v2_tentativi_docenti,public.bussola_v2_questionari,public.bussola_v2_revisioni,public.bussola_v2_segnalazioni_docenti from public,anon,authenticated,service_role;
grant select,insert,update on public.bussola_v2_docenti,public.bussola_v2_questionari,public.bussola_v2_tentativi_docenti to service_role;
grant select,insert,delete on public.bussola_v2_sessioni_docenti to service_role;
grant select,insert on public.bussola_v2_revisioni,public.bussola_v2_segnalazioni_docenti to service_role;
create trigger bussola_docente_modifica before update on public.bussola_v2_docenti for each row execute function public.bussola_v2_data_modifica();

create function public.bussola_v2_quota_docente(p_fingerprint text) returns boolean
language sql security invoker set search_path='' as $$
 insert into public.bussola_v2_tentativi_docenti(fingerprint,finestra)
 values(p_fingerprint,date_trunc('hour',now())+floor(extract(minute from now())/15)*interval '15 minutes')
 on conflict(fingerprint,finestra) do update set tentativi=public.bussola_v2_tentativi_docenti.tentativi+1
 returning tentativi<=20;
$$;
create function public.bussola_v2_assegna_classe(p_docente uuid,p_classe uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 update public.bussola_v2_docenti set classi=array_append(classi,p_classe)
 where id=p_docente and attivo and not p_classe=any(classi) and cardinality(classi)<100;
 return exists(select 1 from public.bussola_v2_docenti where id=p_docente and attivo and p_classe=any(classi));
end; $$;
create function public.bussola_v2_salva_questionario(p_partecipante uuid,p_payload jsonb,p_revision integer) returns integer
language plpgsql security invoker set search_path='' as $$
declare r integer;
begin
 -- Ripetere la stessa richiesta dopo una risposta di rete persa non duplica il salvataggio.
 select revision into r from public.bussola_v2_questionari where partecipante_id=p_partecipante and payload->>'_operation'=p_payload->>'_operation';
 if found then return r; end if;
 if p_revision=0 then
  insert into public.bussola_v2_questionari(partecipante_id,payload) values(p_partecipante,p_payload)
  on conflict do nothing returning revision into r;
 else
  update public.bussola_v2_questionari set payload=payload||p_payload,revision=revision+1,updated_at=now()
  where partecipante_id=p_partecipante and revision=p_revision returning revision into r;
 end if;
 return r;
end; $$;
create function public.bussola_v2_registra_passaggio() returns trigger
language plpgsql security invoker set search_path='' as $$
declare j jsonb; prima jsonb; tipo_evento text; corso_evento text;
begin
 corso_evento=case when tg_table_name='bussola_v2_questionari' then 'bussola' else to_jsonb(new)->>'corso' end;
 j=coalesce(new.payload->'caseJourney',new.payload->'labJourney',new.payload);
 if tg_op='INSERT' then tipo_evento='primo_salvataggio';
 else
  prima=coalesce(old.payload->'caseJourney',old.payload->'labJourney',old.payload);
  if corso_evento='bussola' then
   if new.payload->>'stage'='results' and old.payload->>'stage' is distinct from 'results' then tipo_evento='conclusione';
   elsif new.payload->'answers' is distinct from old.payload->'answers' then tipo_evento='risposta'; end if;
  elsif (j->>'finished')::boolean is true and (prima->>'finished')::boolean is not true then tipo_evento='conclusione';
  elsif j->'done' is distinct from prima->'done' then
   tipo_evento=case when jsonb_array_length(coalesce(j->'done','[]'))<jsonb_array_length(coalesce(prima->'done','[]')) then 'revisione' else 'avanzamento' end;
  elsif (prima->>'finished')::boolean is true and (j->>'finished')::boolean is not true then tipo_evento='revisione';
  end if;
  if tipo_evento='revisione' then
   insert into public.bussola_v2_revisioni(partecipante_id,corso,revision,tipo,snapshot)
   values(old.partecipante_id,corso_evento,old.revision,'prima_della_revisione',old.payload) on conflict do nothing;
  end if;
 end if;
 if tipo_evento is not null then
  insert into public.bussola_v2_revisioni(partecipante_id,corso,revision,tipo,snapshot)
  values(new.partecipante_id,corso_evento,new.revision,tipo_evento,new.payload) on conflict do nothing;
 end if;
 return new;
end; $$;
create trigger bussola_progetti_passaggi after insert or update on public.bussola_v2_progetti for each row execute function public.bussola_v2_registra_passaggio();
create trigger bussola_questionari_passaggi after insert or update on public.bussola_v2_questionari for each row execute function public.bussola_v2_registra_passaggio();
revoke all on function public.bussola_v2_quota_docente(text),public.bussola_v2_assegna_classe(uuid,uuid),public.bussola_v2_salva_questionario(uuid,jsonb,integer),public.bussola_v2_registra_passaggio() from public,anon,authenticated;
grant execute on function public.bussola_v2_quota_docente(text),public.bussola_v2_assegna_classe(uuid,uuid),public.bussola_v2_salva_questionario(uuid,jsonb,integer),public.bussola_v2_registra_passaggio() to service_role;
comment on table public.bussola_v2_revisioni is 'Passaggi significativi dalla data di attivazione. Non ricostruisce uno storico precedente né misura presenza o attenzione.';
comment on table public.bussola_v2_docenti is 'Accessi personali della commissione. Password PBKDF2-SHA256 310000 iterazioni; hash e salt accessibili solo al backend.';
commit;
