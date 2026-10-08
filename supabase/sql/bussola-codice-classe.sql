-- Ingresso con codice breve. Nessun progetto, nominativo o attestato viene riscritto.
begin;
create function public.bussola_v2_nuovo_codice() returns text
language sql volatile security invoker set search_path='' as $$
 select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
   (('x'||substr(replace(gen_random_uuid()::text,'-',''),1,2))::bit(8)::integer % 32)+1,1),'')
 from generate_series(1,6);
$$;
revoke all on function public.bussola_v2_nuovo_codice() from public,anon,authenticated;
grant execute on function public.bussola_v2_nuovo_codice() to service_role;
alter table public.bussola_v2_classi add column codice_breve text
 default public.bussola_v2_nuovo_codice();
-- Le classi già presenti ricevono il codice senza cambiare il loro link originale.
-- Una collisione arresta la migrazione: l'intera transazione viene annullata.
alter table public.bussola_v2_classi alter column codice_breve set not null;
alter table public.bussola_v2_classi add constraint bussola_v2_classi_codice_breve_key unique(codice_breve);
alter table public.bussola_v2_classi add constraint bussola_v2_classi_codice_breve_check
 check(codice_breve ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$');
comment on column public.bussola_v2_classi.codice_breve is 'Codice condiviso per entrare nella classe. Non apre lavori o note di altri alunni. Il token personale rimane distinto.';
create function public.bussola_v2_quota_ingresso(p_fingerprint text) returns boolean
language sql security invoker set search_path='' as $$
 insert into public.bussola_v2_quote(fingerprint,giorno,richieste) values(p_fingerprint,current_date,1)
 on conflict(fingerprint,giorno) do update set richieste=public.bussola_v2_quote.richieste+1
 returning richieste<=2000;
$$;
revoke all on function public.bussola_v2_quota_ingresso(text) from public,anon,authenticated;
grant execute on function public.bussola_v2_quota_ingresso(text) to service_role;
commit;
