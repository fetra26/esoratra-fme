-- ============================================================
--  Rôle « sekretera » (secrétaire du camp) + table STAFF
--  Seuls l'admin et le sekretera peuvent inscrire le staff.
--  À exécuter dans : Supabase > SQL Editor.
-- ============================================================

-- 1) Ajouter le rôle 'sekretera' aux rôles autorisés
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'responsable', 'sekretera', 'en_attente'));

-- 2) Table staff (champs : Anarana, Totem, Andraikitra @ lasy, Église, District, Région)
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  nom text not null,       -- Anarana sy fanampin'anarana
  totem text,              -- Totem
  andraikitra text,        -- Andraikitra anatin'ny Lasy
  eglise text,             -- Église
  district text,           -- District
  region text,             -- Région
  created_at timestamptz default now()
);

-- au cas où la table existait déjà avec l'ancien schéma
alter table staff add column if not exists totem text;
alter table staff add column if not exists eglise text;
alter table staff add column if not exists district text;
alter table staff add column if not exists region text;

alter table staff enable row level security;

-- 3) Accès réservé à l'admin et au sekretera (pas les responsables)
drop policy if exists staff_select on staff;
create policy staff_select on staff for select to authenticated
  using (is_admin() or exists (select 1 from profiles where id = auth.uid() and role = 'sekretera'));

drop policy if exists staff_write on staff;
create policy staff_write on staff for all to authenticated
  using (is_admin() or exists (select 1 from profiles where id = auth.uid() and role = 'sekretera'))
  with check (is_admin() or exists (select 1 from profiles where id = auth.uid() and role = 'sekretera'));

-- 4) Le sekretera peut LIRE les églises (pour la liste déroulante du formulaire staff)
--    (districts est déjà lisible par tout compte connecté)
drop policy if exists eglises_select on eglises;
create policy eglises_select on eglises for select to authenticated
  using (is_admin() or district_id = my_district()
    or exists (select 1 from profiles where id = auth.uid() and role = 'sekretera'));
