-- ============================================================
--  Table STAFF de la Camporée (inscrite par le secrétaire de district)
--  À exécuter dans : Supabase > SQL Editor.
-- ============================================================

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  district_id uuid references districts(id) on delete cascade,
  nom text not null,
  andraikitra text,        -- Andraikitra anatin'ny Lasy
  contact text,            -- Laharan'ny Finday
  created_at timestamptz default now()
);

alter table staff enable row level security;

-- Lecture : admin = tout ; responsable = son district
drop policy if exists staff_select on staff;
create policy staff_select on staff for select to authenticated
  using (is_admin() or district_id = my_district());

-- Écriture : admin = tout ; responsable = son district
drop policy if exists staff_write on staff;
create policy staff_write on staff for all to authenticated
  using (is_admin() or district_id = my_district())
  with check (is_admin() or district_id = my_district());
