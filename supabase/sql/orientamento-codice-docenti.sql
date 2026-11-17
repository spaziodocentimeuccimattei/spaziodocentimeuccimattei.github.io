-- Codice personale dei docenti (decisione di Salvatore del 17/11/2026).
-- Ogni docente ha un codice suo, consegnato al primo invio: con quel codice, senza password,
-- riapre le proprie disponibilità (una voce per scuola, con data facoltativa e nota) e le
-- note delle proprie visite nel registro. La password della Commissione (orientatore) e quella
-- della Funzione Strumentale modificano le voci di tutti; solo la Funzione Strumentale vede i codici.
-- Se il docente o la Commissione cambia la nota di una visita già confermata, la visita torna
-- «da confermare» e la nota precedente resta in nota_precedente.
-- Nessuna riga viene cancellata.

begin;

create table if not exists public.orientamento_docenti (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 80),
  cognome text not null check (char_length(cognome) between 2 and 80),
  codice text not null unique check (codice ~ '^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orientamento_disponibilita
  add column if not exists docente_id uuid references public.orientamento_docenti (id),
  add column if not exists appuntamento_id uuid references public.orientamento_appuntamenti (id);

alter table public.orientamento_attivita
  add column if not exists docente_id uuid references public.orientamento_docenti (id),
  add column if not exists nota_precedente text check (nota_precedente is null or char_length(nota_precedente) <= 600),
  add column if not exists modificata_dal_docente_at timestamptz;

create index if not exists orientamento_disponibilita_docente_idx on public.orientamento_disponibilita (docente_id);
create index if not exists orientamento_attivita_docente_idx on public.orientamento_attivita (docente_id);

alter table public.orientamento_docenti enable row level security;
revoke all on public.orientamento_docenti from public, anon, authenticated, service_role;
grant select, insert, update on public.orientamento_docenti to service_role;

-- Codice di 8 caratteri senza lettere ambigue (niente I, O, 0, 1), dai byte casuali di un UUID v4.
create or replace function public.orientamento_nuovo_codice()
returns text language plpgsql volatile security invoker set search_path = public as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  byte_casuali bytea;
  posizioni constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11];
  v text;
  i int;
begin
  loop
    byte_casuali := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v := '';
    for i in 1..8 loop
      v := v || substr(alfabeto, 1 + (get_byte(byte_casuali, posizioni[i]) % 32), 1);
      if i = 4 then v := v || '-'; end if;
    end loop;
    exit when not exists (select 1 from public.orientamento_docenti where codice = v);
  end loop;
  return v;
end;
$$;
revoke all on function public.orientamento_nuovo_codice() from public, anon, authenticated;
grant execute on function public.orientamento_nuovo_codice() to service_role;

commit;
