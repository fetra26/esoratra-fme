-- ============================================================
--  Ajoute le drapeau « compte désactivé » aux profils.
--  À exécuter dans : Supabase > SQL Editor > New query
-- ============================================================
alter table profiles add column if not exists disabled boolean not null default false;
