-- ============================================================
--  Données de TEST — eSoratra FME
--  À exécuter dans : Supabase > SQL Editor > New query
--  Crée 1 district, 1 église et 5 inscrits.
--  ⚠️ À n'exécuter qu'une seule fois (sinon doublons).
-- ============================================================

with d as (
  insert into districts (nom)
  values ('District Test — Manompana')
  returning id
),
e as (
  insert into eglises (district_id, nom)
  select id, 'Église Centrale Test' from d
  returning id
)
insert into membres (eglise_id, categorie, nom, date_naissance, sexe, kilasy, bapteme, contact, frais, code)
select e.id, v.categorie, v.nom, v.date_naissance, v.sexe, v.kilasy, v.bapteme, v.contact, v.frais, v.code
from e, (values
  ('Mpisavalalana', 'RANDRIANARISOA Tahiry',     date '2013-04-12', 'L', 'Sahaza',  true,  '034 12 345 67', 20000, 'TAHY1'),
  ('Mpisantatra',   'RASOANAIVO Voahangy',       date '2015-09-03', 'V', 'Mpanjaka', false, '034 22 333 44', 15000, 'VOAH2'),
  ('Encadreur',     'RAKOTONIRINA Mamy',         date '1992-01-20', 'L', null,       true,  '034 33 444 55', 20000, 'MAMY3'),
  ('Mpisavalalana', 'RAHARIMALALA Soa',          date '2012-11-28', 'V', 'Sahaza',  true,  '034 44 555 66', 20000, 'SOA44'),
  ('Hafa',          'ANDRIANANTENAINA Tojo',     date '1988-06-15', 'L', null,       false, '034 55 666 77', 20000, 'TOJO5')
) as v(categorie, nom, date_naissance, sexe, kilasy, bapteme, contact, frais, code);

-- Vérifier le résultat :
-- select nom, categorie, code, frais from membres order by nom;
