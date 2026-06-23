-- ============================================================
--  Kilasim-pandrosoana : liste de référence gérable (CRUD)
--  À exécuter dans : Supabase > SQL Editor > New query
-- ============================================================

create table if not exists kilasy (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz default now()
);

create unique index if not exists kilasy_nom_uniq on kilasy (lower(btrim(nom)));

alter table kilasy enable row level security;

-- Lecture : tout utilisateur connecté
drop policy if exists kilasy_select on kilasy;
create policy kilasy_select on kilasy for select to authenticated using (true);

-- Écriture : admin OU responsable (les « secrétaires »)
drop policy if exists kilasy_write on kilasy;
create policy kilasy_write on kilasy for all to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin','responsable')))
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin','responsable')));

-- Quelques valeurs de départ (modifiables / supprimables dans l'app)
insert into kilasy (nom) values
  ('Sakaiza'), ('Mpiara-dia'), ('Mpanaradia'), ('Mpitsoaka'), ('Mpitarika')
on conflict do nothing;
