-- ============================================================
--  Anti-doublons — districts & églises
--  À exécuter dans : Supabase > SQL Editor > New query
--  (1) nettoie les doublons existants, (2) interdit les futurs.
-- ============================================================

-- (1a) Supprimer les districts en doublon (même nom, casse/espaces ignorés),
--      en gardant le plus ancien.
delete from districts a
using districts b
where a.id <> b.id
  and lower(btrim(a.nom)) = lower(btrim(b.nom))
  and a.created_at > b.created_at;

-- (1b) Doublons d'église DANS un même district (le même nom est autorisé
--      dans des districts différents). On garde le plus ancien.
delete from eglises a
using eglises b
where a.id <> b.id
  and a.district_id = b.district_id
  and lower(btrim(a.nom)) = lower(btrim(b.nom))
  and a.created_at > b.created_at;

-- (2a) Unicité du nom de district (insensible à la casse et aux espaces).
create unique index if not exists districts_nom_uniq
  on districts (lower(btrim(nom)));

-- (2b) Unicité du nom d'église PAR district (un même nom peut exister ailleurs).
drop index if exists eglises_nom_uniq;
create unique index if not exists eglises_nom_uniq
  on eglises (district_id, lower(btrim(nom)));
