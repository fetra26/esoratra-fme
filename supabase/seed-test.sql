-- ============================================================
--  Données de DÉMONSTRATION pour vérifier toute la plateforme
--  (tableau de bord, badges, export Excel, encadrement, paiement)
--  À exécuter dans : Supabase > SQL Editor. Relançable sans doublon.
-- ============================================================

-- 1) District démo
insert into districts (nom)
select 'District Démo'
where not exists (select 1 from districts where lower(btrim(nom)) = 'district démo');

-- 2) Églises (3)
insert into eglises (district_id, nom)
select d.id, x.nom
from districts d
cross join (values ('FME Centre'), ('FME Avaratra'), ('FME Atsimo')) as x(nom)
where d.nom = 'District Démo'
  and not exists (select 1 from eglises e where e.district_id = d.id and e.nom = x.nom);

-- 3) Membres (variés : toutes catégories, encadrement volontairement juste)
insert into membres (eglise_id, categorie, nom, date_naissance, sexe, kilasy, bapteme, contact, marim_pandrosoana, frais, code)
select e.id, v.categorie, v.nom, v.dn::date, v.sexe, v.kilasy, v.bapteme, v.contact, v.marim, v.frais, v.code
from eglises e
join districts d on d.id = e.district_id and d.nom = 'District Démo'
join (values
  ('FME Centre',  'Mpisavalalana','RABE Koto',           '2013-03-02','L','Sakaiza',   true,  '',            '', 20000,'DEMO01'),
  ('FME Centre',  'Mpisavalalana','RASOA Hanta',         '2013-07-19','V','Mpiara-dia', false, '',           '', 20000,'DEMO02'),
  ('FME Centre',  'Mpisavalalana','RAKOTO Lova',         '2014-01-11','L','Sakaiza',   true,  '',            '', 20000,'DEMO03'),
  ('FME Centre',  'Mpisavalalana','RANDRIA Soa',         '2012-12-05','V','Mpanaradia', false, '',           '', 20000,'DEMO04'),
  ('FME Centre',  'Mpisantatra',  'RAZAFY Tiana',        '2015-09-21','V','Mpitarika',  false, '',           '', 15000,'DEMO05'),
  ('FME Centre',  'Mpisantatra',  'RANAIVO Faly',        '2015-04-08','L','Mpitsoaka',  false, '',           '', 15000,'DEMO06'),
  ('FME Centre',  'Encadreur',    'RAKOTONIRINA Mamy',   '1990-02-20','L','',           false, '034 11 22 33','Guide', 20000,'DEMO07'),
  ('FME Centre',  'Hafa',         'ANDRIA Tojo',         '1985-06-15','L','',           false, '034 44 55 66','', 20000,'DEMO08'),
  ('FME Avaratra','Mpisavalalana','RABEMANANJARA Aina',  '2013-10-30','V','Sakaiza',   true,  '',            '', 20000,'DEMO09'),
  ('FME Avaratra','Mpisavalalana','RAHARISON Niry',      '2014-05-17','L','Mpiara-dia', false, '',           '', 20000,'DEMO10'),
  ('FME Avaratra','Mpisavalalana','RASOLOFO Hery',       '2013-08-23','L','Sakaiza',   true,  '',            '', 20000,'DEMO11'),
  ('FME Avaratra','Encadreur',    'RAVELOSON Hasina',    '1992-11-02','V','',           false, '034 77 88 99','Voyageur', 20000,'DEMO12'),
  ('FME Atsimo',  'Mpisantatra',  'RANDRIAMASY Fy',      '2015-02-14','V','Mpitarika',  false, '',           '', 15000,'DEMO13'),
  ('FME Atsimo',  'Mpisantatra',  'RAKOTOARISOA Lalaina','2015-11-09','L','Mpitsoaka',  false, '',           '', 15000,'DEMO14'),
  ('FME Atsimo',  'Encadreur',    'RAZANADRAKOTO Voara', '1988-07-25','V','',           false, '034 12 34 56','Guide', 20000,'DEMO15')
) as v(egl, categorie, nom, dn, sexe, kilasy, bapteme, contact, marim, frais, code) on v.egl = e.nom
where not exists (select 1 from membres mm where mm.code = v.code);

-- 4) Paiement (FME Centre marqué payé)
insert into paiements (eglise_id, type, numero_recu, date_envoi, reference, montant, paye, updated_at)
select e.id, 'Orange Money', 'RC-001', current_date, 'REF-DEMO-001',
       (select coalesce(sum(frais),0) from membres m where m.eglise_id = e.id), true, now()
from eglises e
join districts d on d.id = e.district_id and d.nom = 'District Démo'
where e.nom = 'FME Centre'
on conflict (eglise_id) do update
  set type = excluded.type, reference = excluded.reference, montant = excluded.montant, paye = true, updated_at = now();

-- Vérif : select categorie, count(*) from membres group by categorie;
