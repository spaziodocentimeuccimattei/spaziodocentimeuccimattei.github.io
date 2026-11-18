-- RICHIESTE DELL'ATTESTATO VIA EMAIL (Bussola, 18 novembre 2026).
-- NON APPLICATO. Si applica solo dopo: (1) informativa privacy approvata dalla Dirigente, (2) sì esplicito di Salvatore.
-- Migrazione additiva: crea una tabella nuova. Non tocca partecipanti, lavori, note, classi o attestati.
--
-- Che cosa registra, e solo questo: a quale lavoro (partecipante e indirizzo) si riferisce, il nome che va sull'attestato,
-- l'email di un genitore, data e ora del consenso, versione dell'informativa accettata, data dell'invio fatto dalla scuola.
-- Una richiesta per lavoro e indirizzo: se il genitore la ripete, si aggiorna (nuova email, nuovo consenso).
-- Conservazione: la riga si cancella con il partecipante (on delete cascade), quindi alla scadenza dei lavori;
-- la scuola può cancellarla prima dall'area docenti dopo l'invio. Accesso solo dalle Edge Function (service_role).
begin;

create table public.bussola_v2_richieste_attestato (
 id uuid primary key default gen_random_uuid(),
 partecipante_id uuid not null references public.bussola_v2_partecipanti(id) on delete cascade,
 corso text not null check (corso in ('ssas','afm','sia','turismo','cat')),
 nome text not null default '' check (char_length(nome) <= 160),
 email text not null check (char_length(email) between 6 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'),
 consenso_at timestamptz not null default now(),
 informativa text not null check (char_length(informativa) between 1 and 40),
 inviato_at timestamptz,
 created_at timestamptz not null default now(),
 unique (partecipante_id, corso)
);
create index bussola_richieste_attestato_data on public.bussola_v2_richieste_attestato(created_at);
alter table public.bussola_v2_richieste_attestato enable row level security;
revoke all on public.bussola_v2_richieste_attestato from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.bussola_v2_richieste_attestato to service_role;
comment on table public.bussola_v2_richieste_attestato is 'Email di un genitore per ricevere l''attestato della Bussola, con consenso e versione dell''informativa. Solo per l''invio dell''attestato. Accesso solo dalle Edge Function bussola-esperienze e bussola-gestione.';

commit;
