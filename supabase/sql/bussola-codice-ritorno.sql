-- CODICE BREVE PERSONALE PER IL RITORNO DA CASA (riordino Bussola, novembre 2026, agente A11).
-- NON APPLICATO. Da applicare solo dopo il sì esplicito del committente (vedi docs/bussola/riordino-2026-11/SERVER-DA-APPLICARE.md).
-- Migrazione additiva: crea due tabelle nuove e alcune funzioni. Non tocca partecipanti, lavori, note, classi o attestati già presenti.
--
-- Che cosa fa
--  * a ogni partecipante (il «token lungo» già esistente) si può associare UN codice di 6 caratteri leggibili;
--  * il codice è casuale, generato qui nel database, mai ricavato dal nome (il nome non è nemmeno sul server);
--  * il codice è UNICO, e non può mai coincidere con il codice breve di una classe (esistente o futura): vedi «Regola contro le collisioni».
--
-- Alfabeto del codice personale: ABCDEFGHJKMNPQRSTUVWXYZ23456789 (31 simboli: niente 0/O, 1/I, L).
-- I codici delle classi (bussola-codice-classe.sql) usano ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (32 simboli, con la L).
--
-- REGOLA CONTRO LE COLLISIONI (verificabile)
--  1. Un codice personale non contiene mai la lettera L: i codici di classe che la contengono (circa 1 su 6) sono già esclusi per costruzione.
--  2. Per gli altri, il database controlla in entrambe le direzioni, con un blocco condiviso (pg_advisory_xact_lock):
--     - non si può inserire un codice personale uguale a un codice_breve di una classe;
--     - non si può inserire o cambiare il codice_breve di una classe se è già un codice personale
--       (l'errore ha codice 23505 e contiene «codice_breve»: la creazione classi del server lo riprova già da sola, fino a tre volte).
--  3. Oltre al controllo, il lato browser prova prima il codice come codice di classe e solo se la classe non esiste lo prova come codice personale:
--     in nessun caso un codice può aprire due cose diverse.
begin;

create table public.bussola_v2_codici_ritorno (
 partecipante_id uuid primary key references public.bussola_v2_partecipanti(id) on delete cascade,
 codice text not null unique check (codice ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$'),
 created_at timestamptz not null default now()
);
alter table public.bussola_v2_codici_ritorno enable row level security;
revoke all on public.bussola_v2_codici_ritorno from public,anon,authenticated,service_role;
grant select,insert on public.bussola_v2_codici_ritorno to service_role;
comment on table public.bussola_v2_codici_ritorno is 'Codice breve di ritorno da casa: puntatore casuale al partecipante. Non contiene nomi né dati personali. Accesso solo dalla Edge Function bussola-esperienze.';

-- Limite dei tentativi: finestre di 15 minuti, una riga per «impronta» (rete cifrata, oppure la parola «globale»).
create table public.bussola_v2_tentativi_codice (
 fingerprint text not null,
 finestra timestamptz not null,
 tentativi integer not null default 1,
 primary key(fingerprint,finestra)
);
create index bussola_tentativi_codice_finestra on public.bussola_v2_tentativi_codice(finestra);
alter table public.bussola_v2_tentativi_codice enable row level security;
revoke all on public.bussola_v2_tentativi_codice from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.bussola_v2_tentativi_codice to service_role;

-- Generatore: 6 caratteri casuali dal generatore sicuro del database, senza distorsione (scarta i byte >= 248 = 31*8).
create function public.bussola_v2_nuovo_codice_ritorno() returns text
language plpgsql volatile security invoker set search_path='' as $$
declare
 alfabeto constant text:='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
 risultato text:='';
 b integer;
begin
 while length(risultato)<6 loop
  b:=('x'||substr(replace(gen_random_uuid()::text,'-',''),1,2))::bit(8)::integer;
  if b<248 then risultato:=risultato||substr(alfabeto,(b%31)+1,1); end if;
 end loop;
 return risultato;
end;
$$;

-- Controllo incrociato fra codici personali e codici di classe.
create function public.bussola_v2_codice_libero() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtext('bussola_v2_codici_brevi'));
 if tg_table_name='bussola_v2_codici_ritorno' then
  if exists(select 1 from public.bussola_v2_classi where codice_breve=new.codice) then
   raise exception 'Il codice personale coincide con il codice_breve di una classe' using errcode='23505';
  end if;
 else
  if exists(select 1 from public.bussola_v2_codici_ritorno where codice=new.codice_breve) then
   raise exception 'Il codice_breve della classe coincide con un codice personale' using errcode='23505';
  end if;
 end if;
 return new;
end;
$$;
create trigger bussola_codice_ritorno_libero before insert or update of codice on public.bussola_v2_codici_ritorno
 for each row execute function public.bussola_v2_codice_libero();
create trigger bussola_codice_classe_libero before insert or update of codice_breve on public.bussola_v2_classi
 for each row execute function public.bussola_v2_codice_libero();

-- Restituisce il codice del partecipante, creandolo se manca. Nullo se il partecipante non esiste o è scaduto.
create function public.bussola_v2_codice_ritorno(p_partecipante uuid) returns text
language plpgsql security invoker set search_path='' as $$
declare c text; n integer:=0;
begin
 perform 1 from public.bussola_v2_partecipanti where id=p_partecipante and expires_at>now() for update;
 if not found then return null; end if;
 select codice into c from public.bussola_v2_codici_ritorno where partecipante_id=p_partecipante;
 if found then return c; end if;
 loop
  n:=n+1;
  if n>20 then raise exception 'Codice personale non disponibile'; end if;
  c:=public.bussola_v2_nuovo_codice_ritorno();
  begin
   insert into public.bussola_v2_codici_ritorno(partecipante_id,codice) values(p_partecipante,c);
   return c;
  exception when unique_violation then null;
  end;
 end loop;
end;
$$;

-- Limite di frequenza: vero se il tentativo è ammesso. Le righe vecchie di oltre un giorno si cancellano da sole.
create function public.bussola_v2_quota_codice(p_fingerprint text,p_limite integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 delete from public.bussola_v2_tentativi_codice where finestra<now()-interval '1 day';
 insert into public.bussola_v2_tentativi_codice(fingerprint,finestra)
 values(p_fingerprint,date_trunc('hour',now())+floor(extract(minute from now())/15)*interval '15 minutes')
 on conflict(fingerprint,finestra) do update set tentativi=public.bussola_v2_tentativi_codice.tentativi+1
 returning tentativi into n;
 return n<=p_limite;
end;
$$;

revoke all on function public.bussola_v2_nuovo_codice_ritorno(),public.bussola_v2_codice_libero(),public.bussola_v2_codice_ritorno(uuid),public.bussola_v2_quota_codice(text,integer) from public,anon,authenticated;
grant execute on function public.bussola_v2_nuovo_codice_ritorno(),public.bussola_v2_codice_ritorno(uuid),public.bussola_v2_quota_codice(text,integer) to service_role;
commit;

-- COME TORNARE INDIETRO (solo se serve; cancella i codici già distribuiti, i lavori restano):
--   begin;
--   drop trigger bussola_codice_classe_libero on public.bussola_v2_classi;
--   drop table public.bussola_v2_codici_ritorno, public.bussola_v2_tentativi_codice;
--   drop function public.bussola_v2_codice_libero(), public.bussola_v2_nuovo_codice_ritorno(), public.bussola_v2_codice_ritorno(uuid), public.bussola_v2_quota_codice(text,integer);
--   commit;
