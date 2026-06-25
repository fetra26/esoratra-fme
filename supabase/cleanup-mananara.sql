-- ============================================================
--  Nettoyage : supprime les 4 anciens districts Mananara mal nommés
--  (remplacés par Mananara I / II / III / IV — liste définitive).
--  À exécuter dans : Supabase > SQL Editor.
--  ⚠️ Supprimez d'abord les 4 comptes Auth correspondants (voir consigne).
-- ============================================================

delete from districts
where lower(btrim(nom)) in (
  'mananara centre', 'mananara 2', 'sandrakatsy', 'manambolosy'
);
