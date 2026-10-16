-- Le nuove attività restano in attesa della conferma esplicita della Funzione Strumentale.
-- Vale anche per gli inserimenti tramite codice che omettono lo stato.
-- Non modifica righe, identificativi, date, note o conferme già esistenti.
begin;
alter table public.orientamento_attivita
  alter column stato set default 'da_confermare';
commit;
