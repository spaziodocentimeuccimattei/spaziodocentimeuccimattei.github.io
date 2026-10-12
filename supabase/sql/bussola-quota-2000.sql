-- Bussola: limite delle nuove prove per rete portato da 200 a 2000 al giorno (12 ottobre 2026).
-- A scuola tutti i dispositivi escono con un solo indirizzo: con 200 le giornate di orientamento
-- con più classi bloccavano i laboratori. Applicata in produzione il 12/10/2026 (migrazione bussola_quota_2000).
-- create or replace conserva i permessi: eseguibile solo da service_role.
create or replace function public.bussola_v2_quota(p_fingerprint text) returns boolean
language sql security invoker set search_path='' as $$
 insert into public.bussola_v2_quote(fingerprint,giorno,richieste) values(p_fingerprint,current_date,1)
 on conflict(fingerprint,giorno) do update set richieste=public.bussola_v2_quote.richieste+1
 returning richieste<=2000;
$$;
