-- Proposta additiva: non cancella né modifica progetti e note già salvati.
begin;
create table public.bussola_v2_classi (
 id uuid primary key,
 scuola text not null check(char_length(scuola) between 2 and 140),
 comune text not null check(char_length(comune) between 2 and 80),
 classe text not null check(char_length(classe) between 1 and 20),
 anno text not null check(anno ~ '^20[0-9]{2}/20[0-9]{2}$'),
 modalita text not null check(modalita in ('nomi','elenco')),
 codice text not null unique check(codice ~ '^[A-Za-z0-9_-]{43}$'),
 attiva boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(scuola,comune,classe,anno)
);
create table public.bussola_v2_alunni (
 id uuid primary key,
 classe_id uuid not null references public.bussola_v2_classi(id),
 nome text not null check(char_length(nome) between 1 and 80),
 cognome text not null check(char_length(cognome) between 1 and 80),
 codice text unique check(codice is null or codice ~ '^[A-Za-z0-9_-]{43}$'),
 partecipante_id uuid unique references public.bussola_v2_partecipanti(id),
 verificato boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index bussola_v2_alunni_classe on public.bussola_v2_alunni(classe_id,cognome,nome);
create table public.bussola_v2_attestati (
 id uuid primary key default gen_random_uuid(),
 alunno_id uuid not null references public.bussola_v2_alunni(id),
 classe_id uuid not null references public.bussola_v2_classi(id),
 corso text not null check(corso in ('ssas','afm','sia','turismo','cat')),
 revision integer not null check(revision>0),
 impronta text not null check(impronta ~ '^[a-f0-9]{64}$'),
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<=40000),
 created_at timestamptz not null default now(),
 unique(alunno_id,corso,impronta)
);
create index bussola_v2_attestati_alunno on public.bussola_v2_attestati(alunno_id,created_at);
create index bussola_v2_attestati_classe on public.bussola_v2_attestati(classe_id,created_at);
alter table public.bussola_v2_classi enable row level security;
alter table public.bussola_v2_alunni enable row level security;
alter table public.bussola_v2_attestati enable row level security;
revoke all on public.bussola_v2_classi,public.bussola_v2_alunni,public.bussola_v2_attestati from public,anon,authenticated;
grant select,insert,update on public.bussola_v2_classi,public.bussola_v2_alunni to service_role;
grant select,insert on public.bussola_v2_attestati to service_role;
comment on table public.bussola_v2_alunni is 'Nominativi privati per gli attestati: collegamento univoco al partecipante, omonimi distinti. Accesso tramite Edge Function con sessione Funzione Strumentale.';
comment on table public.bussola_v2_attestati is 'Fotografia immutabile del lavoro e del nominativo al momento della generazione. Nessuna valutazione delle capacità.';

create function public.bussola_v2_data_modifica() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at=now(); return new; end; $$;
create trigger bussola_classe_modifica before update on public.bussola_v2_classi for each row execute function public.bussola_v2_data_modifica();
create trigger bussola_alunno_modifica before update on public.bussola_v2_alunni for each row execute function public.bussola_v2_data_modifica();

-- Il proprietario del lavoro è ricavato dal token dall'Edge Function, mai dal browser.
create function public.bussola_v2_iscrivi(p_partecipante uuid,p_classe uuid,p_nome text,p_cognome text,p_codice text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.bussola_v2_classi; a public.bussola_v2_alunni;
begin
 select * into c from public.bussola_v2_classi where id=p_classe and attiva for update;
 if not found then raise exception 'Classe non disponibile'; end if;
 perform 1 from public.bussola_v2_partecipanti where id=p_partecipante and expires_at>now() for update;
 if not found then raise exception 'Partecipante non disponibile'; end if;
 select * into a from public.bussola_v2_alunni where partecipante_id=p_partecipante;
 if found then
  if a.classe_id<>c.id then raise exception 'Il lavoro è già associato a un’altra classe'; end if;
  return to_jsonb(a)-'codice';
 end if;
 if c.modalita='elenco' then
  select * into a from public.bussola_v2_alunni where classe_id=c.id and codice=p_codice for update;
  if not found or a.partecipante_id is not null then raise exception 'Link individuale non disponibile'; end if;
  update public.bussola_v2_alunni set partecipante_id=p_partecipante where id=a.id returning * into a;
 else
  if (select count(*) from public.bussola_v2_alunni where classe_id=c.id)>=500 then raise exception 'Classe completa'; end if;
  insert into public.bussola_v2_alunni(id,classe_id,nome,cognome,codice,partecipante_id)
  values(gen_random_uuid(),c.id,p_nome,p_cognome,p_codice,p_partecipante) returning * into a;
 end if;
 return to_jsonb(a)-'codice';
end; $$;

-- Tutto il gruppo è emesso nella stessa transazione. Se un lavoro o un nome
-- cambia nel frattempo, l'intero gruppo si interrompe senza attestati parziali.
create function public.bussola_v2_emetti(p_documenti jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare d jsonb; a public.bussola_v2_alunni; c public.bussola_v2_classi; p public.bussola_v2_progetti; cert public.bussola_v2_attestati; risultato jsonb='[]'::jsonb;
begin
 if jsonb_typeof(p_documenti)<>'array' or jsonb_array_length(p_documenti) not between 1 and 100 then raise exception 'Selezione non valida'; end if;
 for d in select value from jsonb_array_elements(p_documenti) loop
  select * into a from public.bussola_v2_alunni where id=(d->>'alunno_id')::uuid for update;
  if not found or not a.verificato or a.updated_at<>(d->>'alunno_updated_at')::timestamptz then raise exception 'Nominativo cambiato o non verificato'; end if;
  select * into c from public.bussola_v2_classi where id=a.classe_id for share;
  if c.updated_at<>(d->>'classe_updated_at')::timestamptz then raise exception 'Classe cambiata'; end if;
  select * into p from public.bussola_v2_progetti where partecipante_id=a.partecipante_id and corso=d->>'corso' for share;
  if not found or p.revision<>(d->>'revision')::integer then raise exception 'Lavoro cambiato'; end if;
  insert into public.bussola_v2_attestati(alunno_id,classe_id,corso,revision,impronta,snapshot)
  values(a.id,c.id,d->>'corso',p.revision,d->>'impronta',d->'snapshot') on conflict(alunno_id,corso,impronta) do nothing;
  select * into cert from public.bussola_v2_attestati where alunno_id=a.id and corso=d->>'corso' and impronta=d->>'impronta';
  risultato=risultato||jsonb_build_array(to_jsonb(cert));
 end loop;
 return risultato;
end; $$;
revoke execute on function public.bussola_v2_data_modifica(),public.bussola_v2_iscrivi(uuid,uuid,text,text,text),public.bussola_v2_emetti(jsonb) from public,anon,authenticated;
grant execute on function public.bussola_v2_data_modifica(),public.bussola_v2_iscrivi(uuid,uuid,text,text,text),public.bussola_v2_emetti(jsonb) to service_role;
commit;
