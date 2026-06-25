-- ============================================================
--  RÉINITIALISATION COMPLÈTE des données
--  Supprime : districts, églises, membres, paiements
--             + tous les comptes responsables (*.resp@esoratra.mg)
--  CONSERVE  : votre compte admin et la liste Kilasim-pandrosoana
--  ⚠️ IRRÉVERSIBLE. À exécuter dans Supabase > SQL Editor.
-- ============================================================

-- 1) Données opérationnelles (districts cascade églises -> membres/paiements)
delete from paiements;
delete from membres;
delete from eglises;
delete from districts;

-- 2) Comptes responsables uniquement (l'admin, en gmail, est conservé)
delete from auth.users where email ilike '%.resp@esoratra.mg';

-- 3) (Optionnel) vider aussi la liste Kilasim-pandrosoana :
-- delete from kilasy;
