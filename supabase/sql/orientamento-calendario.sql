-- Calendario dell'orientamento nelle scuole secondarie di primo grado.
-- Due tipi di appuntamento: incontro nelle aule con gli studenti ('aule') e open day della
-- scuola media, dove il Mattei ha un proprio stand in un locale grande ('stand').
-- Una data è 'prevista' finché la scuola media non la conferma. Data, tipo, orario, luogo e
-- stato sono mostrati ai docenti nella pagina pubblica; la nota resta riservata.
-- Non inserire nominativi o recapiti dei referenti scolastici, nemmeno nelle note.

create table if not exists public.orientamento_appuntamenti (
  id uuid primary key default gen_random_uuid(),
  scuola_id text not null references public.orientamento_scuole (id),
  tipo text not null check (tipo in ('aule', 'stand')),
  data date not null,
  ora_inizio time,
  ora_fine time,
  luogo text not null default '' check (char_length(luogo) <= 160),
  nota text not null default '' check (char_length(nota) <= 600),
  stato text not null default 'prevista' check (stato in ('prevista', 'confermata')),
  archiviata boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ora_fine is null or ora_inizio is null or ora_fine > ora_inizio)
);

create index if not exists orientamento_appuntamenti_data_idx on public.orientamento_appuntamenti (data, ora_inizio);

alter table public.orientamento_appuntamenti enable row level security;
revoke all on public.orientamento_appuntamenti from public, anon, authenticated;
grant select, insert, update on public.orientamento_appuntamenti to service_role;
