-- Alunni dell'istituto che partecipano agli incontri di orientamento nelle scuole medie, insieme ai docenti
-- (decisione di Salvatore del 23/11/2026). Elenco di nomi con la classe, per ogni data; si compila dalla
-- Gestione con la password della Funzione Strumentale e non compare mai nelle pagine pubbliche.
alter table public.orientamento_appuntamenti drop constraint if exists orientamento_appuntamenti_alunni_check;
alter table public.orientamento_appuntamenti drop column if exists alunni;
alter table public.orientamento_appuntamenti add column if not exists alunni text[] not null default '{}';
alter table public.orientamento_appuntamenti add constraint orientamento_appuntamenti_alunni_check check (cardinality(alunni) <= 80);
