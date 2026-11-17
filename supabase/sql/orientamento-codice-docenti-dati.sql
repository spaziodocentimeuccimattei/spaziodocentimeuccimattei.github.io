-- Una tantum, dopo orientamento-codice-docenti.sql (17/11/2026).
-- 1. Ogni vecchio invio con più scuole diventa una voce per scuola, con la stessa nota, lo stesso
--    stato e la stessa data di invio: la nota resta del docente che l'ha scritta e delle sue scuole.
-- 2. Ogni docente già presente (disponibilità o registro) riceve il suo codice personale.
-- 3. Disponibilità e righe del registro si collegano al docente confrontando nome e cognome.
-- Nessuna riga viene cancellata.

begin;

insert into public.orientamento_disponibilita (nome, cognome, scuole, nota, stato, in_classifica, created_at, updated_at)
select d.nome, d.cognome, array[s.scuola], d.nota, d.stato, d.in_classifica, d.created_at, d.updated_at
from public.orientamento_disponibilita d
cross join lateral unnest(d.scuole[2:cardinality(d.scuole)]) as s(scuola)
where cardinality(d.scuole) > 1;

update public.orientamento_disponibilita set scuole = scuole[1:1] where cardinality(scuole) > 1;

-- Riga del registro del 16/11/2026 con nome e cognome invertiti (Villamassargia, 05/11/2026).
update public.orientamento_attivita set nome = 'Salvatore', cognome = 'Picconi'
where id = 'efd3d492-b3df-4cf7-a9bd-55369b449f35' and nome = 'Picconi' and cognome = 'Salvatore';

create temporary table persone on commit drop as
select distinct on (chiave) nome, cognome, chiave from (
  select trim(nome) nome, trim(cognome) cognome, created_at,
    lower(regexp_replace(trim(nome) || ' ' || trim(cognome), '\s+', ' ', 'g')) chiave
  from public.orientamento_disponibilita
  union all
  select trim(nome), trim(cognome), created_at,
    lower(regexp_replace(trim(nome) || ' ' || trim(cognome), '\s+', ' ', 'g'))
  from public.orientamento_attivita
) x
order by chiave, (nome <> lower(nome)) desc, created_at desc;

insert into public.orientamento_docenti (nome, cognome, codice)
select p.nome, p.cognome, public.orientamento_nuovo_codice()
from persone p
where not exists (
  select 1 from public.orientamento_docenti t
  where lower(regexp_replace(t.nome || ' ' || t.cognome, '\s+', ' ', 'g')) = p.chiave
);

update public.orientamento_disponibilita d set docente_id = t.id
from public.orientamento_docenti t
where d.docente_id is null
  and lower(regexp_replace(trim(d.nome) || ' ' || trim(d.cognome), '\s+', ' ', 'g'))
    = lower(regexp_replace(t.nome || ' ' || t.cognome, '\s+', ' ', 'g'));

update public.orientamento_attivita a set docente_id = t.id
from public.orientamento_docenti t
where a.docente_id is null
  and lower(regexp_replace(trim(a.nome) || ' ' || trim(a.cognome), '\s+', ' ', 'g'))
    = lower(regexp_replace(t.nome || ' ' || t.cognome, '\s+', ' ', 'g'));

commit;
