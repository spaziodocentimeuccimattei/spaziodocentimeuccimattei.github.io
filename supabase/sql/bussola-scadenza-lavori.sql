-- SCADENZA DEI LAVORI FINO A FINE ISCRIZIONI (riordino Bussola, novembre 2026, agente A11).
-- NON APPLICATO. Da applicare solo dopo il sì esplicito del committente e DOPO aver scritto la data qui sotto.
--
-- Che cosa trovato nel codice: bussola_v2_partecipanti.expires_at ha come valore predefinito now()+30 giorni
-- (supabase/sql/bussola-esperienze-v2.sql, riga 6). La Edge Function bussola-esperienze inserisce solo token_hash,
-- quindi la scadenza è decisa DAL DATABASE, non dalla funzione, e non viene mai rinnovata. Il questionario
-- (bussola_v2_questionari) e gli attestati non hanno una scadenza propria: dipendono da quella del partecipante.
--
-- Che cosa fa questo file
--  1. definisce la funzione public.bussola_v2_scadenza_lavori(), l'UNICO posto in cui sta la data;
--  2. la usa come valore predefinito per i partecipanti NUOVI (mai meno di 30 giorni dalla creazione);
--  3. porta a quella data i partecipanti GIÀ ESISTENTI e NON ancora scaduti. Non accorcia mai nessuna scadenza
--     e non riapre i lavori già scaduti.
-- Per spostare la data in futuro basta rieseguire la prima parte (create or replace) con un'altra data.

-- ====================================================================================================
-- PARAMETRO DA CONFERMARE: ultimo giorno di iscrizioni 2027/28, formato AAAA-MM-GG.
-- Il valore qui sotto è un SEGNAPOSTO, NON una data: finché non lo sostituisci con la data ufficiale
-- (circolare del Ministero dell'Istruzione e del Merito sulle iscrizioni 2027/28, non ancora pubblicata
-- al 15/11/2026), il file si ferma con un errore e non cambia nulla.
-- ====================================================================================================
begin;
do $do$
declare
 ultimo_giorno constant text:='SEGNAPOSTO-DA-CONFERMARE';   -- <<< QUI VA LA DATA nel formato AAAA-MM-GG, cioè anno-mese-giorno
 giorno date;
begin
 if ultimo_giorno !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
  raise exception 'Manca la data di fine iscrizioni: sostituisci il segnaposto con la data ufficiale (AAAA-MM-GG) e riesegui.';
 end if;
 giorno:=ultimo_giorno::date;
 if giorno<=current_date or giorno>current_date+interval '18 months' then
  raise exception 'La data % è nel passato o oltre 18 mesi: controllala.',giorno;
 end if;
 -- La scadenza è la mezzanotte (ora italiana) alla fine di quel giorno.
 execute format($f$create or replace function public.bussola_v2_scadenza_lavori() returns timestamptz
  language sql stable security invoker set search_path='' as $b$
   select greatest(((%L::date+1)::timestamp at time zone 'Europe/Rome'),now()+interval '30 days')
  $b$$f$,giorno);
end;
$do$;
revoke all on function public.bussola_v2_scadenza_lavori() from public,anon,authenticated;
grant execute on function public.bussola_v2_scadenza_lavori() to service_role;

alter table public.bussola_v2_partecipanti alter column expires_at set default public.bussola_v2_scadenza_lavori();

-- Partecipanti già esistenti e non ancora scaduti: la scadenza si allunga, mai si accorcia.
update public.bussola_v2_partecipanti set expires_at=public.bussola_v2_scadenza_lavori()
 where expires_at>now() and expires_at<public.bussola_v2_scadenza_lavori();
commit;

-- COME TORNARE INDIETRO (le scadenze già allungate non si possono riportare a «30 giorni dalla creazione» in modo esatto:
-- prima di applicare, salvare l'elenco con:  select id,expires_at from public.bussola_v2_partecipanti;  ):
--   alter table public.bussola_v2_partecipanti alter column expires_at set default (now()+interval '30 days');
--   drop function public.bussola_v2_scadenza_lavori();
-- e, se si vuole, riportare ogni riga al valore salvato (expires_at = created_at + interval '30 days' per chi non l'ha mai rinnovato).
