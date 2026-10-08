-- Correzione additiva per database Supabase con privilegi predefiniti.
-- Non modifica dati o i permessi dei precedenti progetti e note.
begin;
revoke all on public.bussola_v2_classi,public.bussola_v2_alunni,public.bussola_v2_attestati from public,anon,authenticated,service_role;
grant select,insert,update on public.bussola_v2_classi,public.bussola_v2_alunni to service_role;
grant select,insert on public.bussola_v2_attestati to service_role;
commit;
