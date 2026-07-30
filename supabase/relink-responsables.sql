-- ============================================================
--  Ré-associe chaque responsable à SON district
--  (leur district_id était devenu null après recréation des districts).
--  Correspondance : préfixe de l'email  ↔  nom du district « sluggé ».
--  À exécuter dans : Supabase > SQL Editor.
-- ============================================================

create extension if not exists unaccent;

update profiles p
set district_id = d.id
from districts d
where p.role = 'responsable'
  and p.email like '%.resp@esoratra.mg'
  and lower(regexp_replace(unaccent(d.nom), '[^a-zA-Z0-9]', '', 'g'))
      = split_part(p.email, '.resp@', 1);

-- Vérifier ceux qui restent sans district (nom d'email ne correspond à aucun district) :
-- select email from profiles where role='responsable' and district_id is null;
