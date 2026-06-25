-- ============================================================
--  Garantit l'unicité du code des membres (anti-doublon).
--  À exécuter dans : Supabase > SQL Editor.
-- ============================================================

-- (Sécurité) ré-attribue un nouveau code aux éventuels doublons existants
-- avant de poser la contrainte.
with d as (
  select id, row_number() over (partition by code order by created_at) as rn
  from membres where code is not null
)
update membres m
set code = upper(substr(md5(random()::text), 1, 6))
from d
where m.id = d.id and d.rn > 1;

-- Index unique sur le code (chaque membre a un code distinct)
create unique index if not exists membres_code_uniq
  on membres (code) where code is not null;
