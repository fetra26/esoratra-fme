-- ============================================================
--  Camporée Manompana — schéma Supabase (Postgres)
--  À exécuter dans : Supabase > SQL Editor > New query
-- ============================================================

-- ---------- Tables de référence ----------
create table if not exists districts (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  created_at timestamptz default now()
);

create table if not exists eglises (
  id uuid primary key default gen_random_uuid(),
  district_id uuid references districts(id) on delete cascade,
  nom text not null,
  created_at timestamptz default now()
);

-- ---------- Membres (fidèle aux fiches papier) ----------
create table if not exists membres (
  id uuid primary key default gen_random_uuid(),
  eglise_id uuid references eglises(id) on delete cascade,
  categorie text not null check (categorie in ('Mpisavalalana','Mpisantatra','Encadreur','Hafa')),
  nom text not null,
  date_naissance date,
  sexe text check (sexe in ('L','V')),
  kilasy text,
  bapteme boolean default false,
  contact text,
  marim_pandrosoana text,
  andraikitra text,
  chef_guide text,
  date_cg date,
  frais integer default 0,
  code text,
  created_at timestamptz default now()
);

-- ---------- Paiement par église (une délégation = un paiement) ----------
create table if not exists paiements (
  eglise_id uuid primary key references eglises(id) on delete cascade,
  type text,
  numero_recu text,
  date_envoi date,
  reference text,
  montant integer default 0,
  paye boolean default false,
  updated_at timestamptz default now()
);

-- ---------- Profils utilisateurs (rôle + district) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nom text,
  role text not null default 'en_attente' check (role in ('admin','responsable','en_attente')),
  district_id uuid references districts(id) on delete set null,
  created_at timestamptz default now()
);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Fonctions d'aide (security definer = pas de récursion RLS) ----------
create or replace function public.is_admin() returns boolean
  language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_district() returns uuid
  language sql security definer stable set search_path = public as $$
  select district_id from profiles where id = auth.uid();
$$;

-- ============================================================
--  Row Level Security
-- ============================================================
alter table districts  enable row level security;
alter table eglises    enable row level security;
alter table membres    enable row level security;
alter table paiements  enable row level security;
alter table profiles   enable row level security;

-- Profils : chacun voit le sien ; l'admin voit et modifie tout
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or is_admin());
drop policy if exists profiles_update_admin on profiles;
create policy profiles_update_admin on profiles for update to authenticated
  using (is_admin()) with check (is_admin());

-- Districts : lecture pour tout connecté ; écriture admin uniquement
drop policy if exists districts_select on districts;
create policy districts_select on districts for select to authenticated using (true);
drop policy if exists districts_write on districts;
create policy districts_write on districts for all to authenticated
  using (is_admin()) with check (is_admin());

-- Églises : admin = tout ; responsable = lecture de SON district seulement
drop policy if exists eglises_select on eglises;
create policy eglises_select on eglises for select to authenticated
  using (is_admin() or district_id = my_district());
drop policy if exists eglises_write on eglises;
create policy eglises_write on eglises for all to authenticated
  using (is_admin()) with check (is_admin());

-- Membres : admin = tout ; responsable = membres des églises de son district
drop policy if exists membres_select on membres;
create policy membres_select on membres for select to authenticated using (
  is_admin() or exists (
    select 1 from eglises e where e.id = membres.eglise_id and e.district_id = my_district()
  )
);
drop policy if exists membres_write on membres;
create policy membres_write on membres for all to authenticated using (
  is_admin() or exists (
    select 1 from eglises e where e.id = membres.eglise_id and e.district_id = my_district()
  )
) with check (
  is_admin() or exists (
    select 1 from eglises e where e.id = membres.eglise_id and e.district_id = my_district()
  )
);

-- Paiements : même cloisonnement que les membres
drop policy if exists paiements_select on paiements;
create policy paiements_select on paiements for select to authenticated using (
  is_admin() or exists (
    select 1 from eglises e where e.id = paiements.eglise_id and e.district_id = my_district()
  )
);
drop policy if exists paiements_write on paiements;
create policy paiements_write on paiements for all to authenticated using (
  is_admin() or exists (
    select 1 from eglises e where e.id = paiements.eglise_id and e.district_id = my_district()
  )
) with check (
  is_admin() or exists (
    select 1 from eglises e where e.id = paiements.eglise_id and e.district_id = my_district()
  )
);

-- ============================================================
--  APRÈS votre première inscription dans l'application,
--  promouvez votre compte en admin (remplacez l'email) :
--
--    update profiles set role = 'admin'
--    where email = 'votre.email@exemple.com';
-- ============================================================
