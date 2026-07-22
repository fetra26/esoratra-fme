-- ============================================================
--  Rôle « sekretera » (secrétaire du camp) + table STAFF
--  Seuls l'admin et le sekretera peuvent inscrire le staff.
--  À exécuter dans : Supabase > SQL Editor.
-- ============================================================

-- 1) Ajouter le rôle 'sekretera' aux rôles autorisés
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'responsable', 'sekretera', 'en_attente'));

-- 2) Table staff
create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  district_id uuid references districts(id) on delete set null,
  nom text not null,
  andraikitra text,        -- Andraikitra anatin'ny Lasy
  contact text,            -- Laharan'ny Finday
  created_at timestamptz default now()
);

alter table staff enable row level security;

-- 3) Accès réservé à l'admin et au sekretera (pas les responsables)
drop policy if exists staff_select on staff;
create policy staff_select on staff for select to authenticated
  using (is_admin() or exists (select 1 from profiles where id = auth.uid() and role = 'sekretera'));

drop policy if exists staff_write on staff;
create policy staff_write on staff for all to authenticated
  using (is_admin() or exists (select 1 from profiles where id = auth.uid() and role = 'sekretera'))
  with check (is_admin() or exists (select 1 from profiles where id = auth.uid() and role = 'sekretera'));
