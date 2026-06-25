-- ============================================================
--  Import des églises FME 2025 (rattachées à leur district)
--  Généré automatiquement. À exécuter dans Supabase > SQL Editor.
--  Idempotent : relançable sans doublon.
-- ============================================================

-- Unicité d'église PAR district (même nom autorisé dans des districts différents)
drop index if exists eglises_nom_uniq;
create unique index if not exists eglises_nom_uniq on eglises (district_id, lower(btrim(nom)));

-- S'assurer que les districts cibles existent
insert into districts (nom)
select x.nom from (values
  ('Ambodirano'),
  ('Ambohimasina'),
  ('Amparafa'),
  ('Andilamena'),
  ('Anosibe an''Ala'),
  ('Antsahatanteraka'),
  ('Beryl Rose'),
  ('Brickaville'),
  ('Fénérive-Est'),
  ('Mahanoro'),
  ('Mananara Centre'),
  ('Mananara 2'),
  ('Sandrakatsy'),
  ('Magarano'),
  ('Maroantsetra 1'),
  ('Maroantsetra 2'),
  ('Maroantsetra 3'),
  ('Moramanga 1'),
  ('Moramanga 2'),
  ('Sainte-Marie'),
  ('Salazamay'),
  ('Soanierana Ivongo'),
  ('Tanambe'),
  ('Tsinjoarivo'),
  ('Vatomandry'),
  ('Vavatenina'),
  ('Maroantsetra 4'),
  ('Manambolosy'),
  ('Amboasary')
) as x(nom)
where not exists (select 1 from districts d where lower(btrim(d.nom)) = lower(btrim(x.nom)));

-- Ambodirano  (25 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('ANOSIBORIBORY'),
  ('ANTANANDAVA'),
  ('MAHATSINJO I'),
  ('RANOMAINTY'),
  ('FIADANANA'),
  ('BRIEVILLE'),
  ('AMBODIAVIAVY'),
  ('MAHATSINJO II'),
  ('TSARASAOTRA'),
  ('MORARANO CHROME'),
  ('AMBOHITROMBY'),
  ('ANKORIRIKA'),
  ('SAPANA''EFATRA'),
  ('ANTANIMAFY'),
  ('AMBAKIRENY'),
  ('ANALAVOLA'),
  ('ANDRANOBE'),
  ('AMBODIAMONTANA'),
  ('AMBOHIDRONONO'),
  ('VAKINDRANO'),
  ('SOALAZAINA'),
  ('ANDILAMENAKELY'),
  ('BESAKAY'),
  ('AMBOHINIERENANA'),
  ('AMPASIKELY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Ambodirano'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Ambohimasina  (8 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('AMBOHIMASINA'),
  ('MANAKAMBOLA'),
  ('ANTANIFOTSY'),
  ('AMBOHIBOROMANGA'),
  ('MANGABE'),
  ('ILAFY AMBOHIMASINA'),
  ('AMBOARABE DIDY'),
  ('MAISON CENTRALE')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Ambohimasina'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Amparafa  (30 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('AMBATOMAINTY'),
  ('AMBOHIMANDROSO'),
  ('AMBOHIPENO'),
  ('AMPASIMBOLA'),
  ('AMPARAFARVOLA'),
  ('MORARANO NORD'),
  ('ANDILANA SUD'),
  ('ANOSIBE'),
  ('AMBONDRONA'),
  ('AMBALALONTY'),
  ('SAHAMAMY'),
  ('AMBOHITRARIVO'),
  ('AMBONDROALA'),
  ('SAKOAMADINIKA'),
  ('MADSOKOAMENA'),
  ('AMBODIATAFANA'),
  ('AMBODIMANGA'),
  ('AMPASINANDRANO'),
  ('ANIOSIKELY'),
  ('ANTSIRAKIBORONA'),
  ('AMBOHIMANARINA'),
  ('AMPARIHIMAINA'),
  ('AMPAITANY'),
  ('AMBODIVOARA'),
  ('AMPIALAHOANA'),
  ('VODIALA BARAZY'),
  ('ANDREBAKELY'),
  ('AMPASIKELY'),
  ('SAHAMALOTO'),
  ('BEDIDY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Amparafa'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Andilamena  (9 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('ANDILAMENA'),
  ('AMBATOHARANANA'),
  ('SAHAVINAKY'),
  ('ANTANIMENABAKA'),
  ('BEMAINTSO'),
  ('SAHAVOLO'),
  ('ANTSIRABE'),
  ('MAITSOKELY'),
  ('MIARINARIVO')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Andilamena'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Anosibe an'Ala  (11 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('ANOSIBE AN''ALA'),
  ('ANDRANOTAPAKA'),
  ('AMBATOHARANANA'),
  ('ANATANAMBAO IFASINA'),
  ('RARZAN VILLE'),
  ('MAHATSARA'),
  ('AMBATOMASINA'),
  ('ANTENIMBE'),
  ('MAROMBY'),
  ('NIAROVANA'),
  ('ANDROANGAVOLA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Anosibe an''Ala'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Antsahatanteraka  (13 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('ANTAHATANTERAKA'),
  ('AMBOHITSILAOZANA'),
  ('ANTAHALAVA'),
  ('ANTSAHAMAROVA'),
  ('ANDREBA GARA'),
  ('AMBOHIDAVA'),
  ('ANDRANOMENA'),
  ('AMBOHIJANAHARY'),
  ('AMBOHIMANJAKA 1'),
  ('AMBOHITRIBE'),
  ('AMBOHIMANJAKA 2'),
  ('AMBOHITRAPIRANA'),
  ('ANDRANOMALAZA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Antsahatanteraka'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Beryl Rose  (10 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('BERYL ROSE'),
  ('AMBOLOMADINIKA'),
  ('DEPOT ANALAKINININA'),
  ('FRANCOPHONE'),
  ('MANGARIVOTRA SUD'),
  ('VERRERIE'),
  ('ANGLOPHONE'),
  ('ANDRORANGA'),
  ('TSARAHONENANA'),
  ('MORARANO')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Beryl Rose'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Brickaville  (17 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('BRICKAVILLE'),
  ('AMBINANINONY'),
  ('MAROFODY'),
  ('ANIVORANO'),
  ('AMBATOLAMPY'),
  ('AMPASIMBE'),
  ('RANOMAFANA'),
  ('SAHANAMPINGA'),
  ('ANTSAPANANA'),
  ('SERANATSARA I'),
  ('LANIVOLO'),
  ('MAROMAMY'),
  ('AMBOHIPENO'),
  ('ANDRAVOLAMBITA'),
  ('SERANATSARA II'),
  ('ANDEKALEKA'),
  ('LOHARIANDAVA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Brickaville'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Fénérive-Est  (24 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('MAHAVELONKELY'),
  ('AMPARATANANA'),
  ('SAHAVOLA'),
  ('MAHANOROKELY'),
  ('AMBOHIMARINA'),
  ('AMPASIMBOLA'),
  ('SAHAORANA'),
  ('VOHITRAMBO'),
  ('RANTOLAVA'),
  ('AMPARIHILAVA'),
  ('VOHIPENO'),
  ('AMBODIKILO'),
  ('AMPIFERANTANY'),
  ('AMPASIMBE'),
  ('AMPSINA MANINGORO'),
  ('MAHAMBO'),
  ('AMBODIATAFANA'),
  ('MAHAVANONA'),
  ('AMBAKOANA'),
  ('AMBODIAPALY'),
  ('ANTANETILAVA'),
  ('SAHATAVY'),
  ('AMBOLOTARA'),
  ('ANTSIRABE SUD')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Fénérive-Est'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Mahanoro  (19 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('MAHANORO AMBALAKININA'),
  ('AMPAMPANAMBO'),
  ('TANDROROHO'),
  ('AMPITAKIHOSY'),
  ('MAROFODY'),
  ('MAROLAMBO'),
  ('MAROFATSY'),
  ('AMBINANINDRANO SANDRANAMBY'),
  ('BEFOTAKA I'),
  ('BEFOTAKA II'),
  ('AMBODIRIANA'),
  ('AMBATOTELO'),
  ('ANDRAVORAVO'),
  ('AMBINANINDRANO BE'),
  ('AMPASIMANDREVO'),
  ('TAOLANDRAVINA'),
  ('AMBOHITRANALA'),
  ('SAHAKEVO'),
  ('TANAMBAO I')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Mahanoro'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Mananara Centre  (58 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('ANTANAMBAO'),
  ('AMBODIMANGA I'),
  ('LAMPENY'),
  ('AMBINANIMBAOKA'),
  ('TENINA'),
  ('MAHANORO'),
  ('AMBOHITRAIVO'),
  ('ANDAPANAPOMBO'),
  ('MADIORANO'),
  ('FANORAHANA'),
  ('ANALAJAHANA'),
  ('AMBODIMANDRESY'),
  ('MANABOLOSY'),
  ('ANDASIBE'),
  ('AMBOHITSARA'),
  ('ANTANGANA'),
  ('SAHASOA II'),
  ('ANKORABE'),
  ('SAHAVOLO'),
  ('AMBOHISOA'),
  ('ANTSIRA'),
  ('TSARATANANA'),
  ('MAROVOARA'),
  ('AMBODIASINA MAROVOARA'),
  ('ANKOBA II'),
  ('AMBODIMANGA II'),
  ('SAHAVIA'),
  ('AMBODIAPANA'),
  ('ANDOLANA'),
  ('ANKOBA I'),
  ('MAHASOA'),
  ('MAHALINA'),
  ('ANDAPIELY'),
  ('ANOROBY'),
  ('MANAKANA'),
  ('AMBODISATRANA I'),
  ('SAHIVO'),
  ('AMBODIASINA AMBINANIBOKA'),
  ('SAHASOA III'),
  ('VANONO'),
  ('AMBODISATRANA II'),
  ('AMBODISIFY'),
  ('ANTANANDAVA (M/RA)'),
  ('ANTANABAOTANJONA'),
  ('ANTANABAOBELONDO'),
  ('ANDILABE'),
  ('FLANTEZA'),
  ('LAMPENIELY'),
  ('ANTANABAOTSARAVOLO'),
  ('AMBALAFONTSY'),
  ('ANTSIRABE TENINA'),
  ('ANTANADAVA (Ambohisoa)'),
  ('LAMPASINA TENINA'),
  ('SAHATSARA'),
  ('AMBINANIROA'),
  ('ANTARALAVA'),
  ('AMBODIMANGAMARO'),
  ('ANTANAMBAORIVOTRA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Mananara Centre'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Mananara 2  (35 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('BERYL'),
  ('AMBODIROTRA'),
  ('ANALAMPOTSY'),
  ('ANTANETILAVA'),
  ('AMBODIVOHITRA'),
  ('ANTANAMBAOBE'),
  ('ANTANANANIVO'),
  ('TSARAVATO'),
  ('MANOMBO'),
  ('VOHIPATAKANA'),
  ('ANALANANA'),
  ('MAROBOKY'),
  ('SAHASOA I'),
  ('SAROMAONA'),
  ('ANTANAMBAO MAHATSIRY'),
  ('ANTSIRATENINA'),
  ('AMPAHAMAKIANA'),
  ('AMBODIVOANIO'),
  ('AMPODIAMPANA'),
  ('BEFOZA'),
  ('AMPANASANDAMBA'),
  ('AMBOHIMITSIRY'),
  ('AMBALAVOLA'),
  ('ANTANAMBAO ZAHANA'),
  ('IMORONA'),
  ('TSARATANANA'),
  ('ANTANANTSARA'),
  ('BEALANANA'),
  ('AMBODIROTRA HELY'),
  ('AMBATELO'),
  ('VAKOANINA'),
  ('ANKARIMBELONA'),
  ('FITANA'),
  ('ANDRANOMANDEVY/AMBODITONDINGA'),
  ('ANTEVIALAFOTSY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Mananara 2'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Sandrakatsy  (28 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('SANDRAKATSY'),
  ('AMBODIMANGA TOLONGOINA'),
  ('ANTARAMBARAHINA'),
  ('TANIBE'),
  ('ANTENIKELY'),
  ('AMPISOKINA'),
  ('AMBODIMAMPAY'),
  ('AMBATOHARANANA'),
  ('ANDRAPATIBE'),
  ('AMBAHIKARABO'),
  ('VATOLAVA'),
  ('AMBODIATAFANA'),
  ('MAROANDIANA'),
  ('AMBALAHASINA'),
  ('AMBALAFEFY'),
  ('AMBINANIROA'),
  ('ANDRANOMBAZAHA'),
  ('MAKADABO'),
  ('AMBOHIMENA'),
  ('MAROMANDIA'),
  ('VARARY'),
  ('IFASINA'),
  ('ANDIILAMENA'),
  ('AMBODIMANGA TELO'),
  ('SAHARANGO'),
  ('AMBOHITSARA'),
  ('AMBODIVASEVA'),
  ('ANTANAMBAO MANDRESY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Sandrakatsy'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Magarano  (39 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('AMBATOHARANANA'),
  ('TANJOMBE'),
  ('FANANDRANA'),
  ('AMBODIMANGA'),
  ('AMBODILAZANA'),
  ('MAROFINARITRA'),
  ('MAROVATO'),
  ('SAVIAVY'),
  ('22.201A'),
  ('SATRANDROY'),
  ('MAHAVELONA'),
  ('ANIVORANOKELY'),
  ('SOAFIAINANA'),
  ('AMBODIKILY'),
  ('TSANGAMBATO'),
  ('ANTSAHABE'),
  ('ANDRANOAMBOLAVA'),
  ('MANGARANO'),
  ('FARAFATY'),
  ('ANDRANOMADIO'),
  ('ANTSIRABE II'),
  ('AMPILAMINANA'),
  ('TSARAKOFAFA'),
  ('CARREAUX 7'),
  ('ANTSANGAMBATO'),
  ('ANKAREFO'),
  ('AMBALAMANASY'),
  ('TSARAHONENANA'),
  ('TSARARIVOTRA'),
  ('SILOAMA'),
  ('TANANDAVA'),
  ('ANTETEZATONA'),
  ('VOHITRAMBATO'),
  ('AMBODIBONARA'),
  ('AMBATOMITAMBA'),
  ('AMBINANY'),
  ('ANDRANOKOBAKA'),
  ('MAROSERANANA'),
  ('AMBARIFOANA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Magarano'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Maroantsetra 1  (30 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('TANAMBAO'),
  ('SONIERANA'),
  ('MARIARANO'),
  ('SAHORANA'),
  ('AMBINANITELO'),
  ('MADIOTSIFAFANA'),
  ('AMBATOANA'),
  ('ANDRANONANGOZO'),
  ('ANJAHAMARINA'),
  ('ANDAVANIO'),
  ('AMBOHITSARA'),
  ('AMPATAKANA'),
  ('VALAMBAHOAKA'),
  ('SAHAMADIO'),
  ('RANTAVATOBE'),
  ('AMBALAMAHOGO'),
  ('MAROVOVONANA'),
  ('SAHASINDRO'),
  ('MAHARANINA'),
  ('MAROVATO'),
  ('ANANTONAMBILANY'),
  ('AMBODIARAMY'),
  ('AMBOHIFIAINANA'),
  ('ANJANGAZANA'),
  ('AMBODIADABO'),
  ('AMBALARANO'),
  ('ANKOFA'),
  ('AMBODIVATO'),
  ('AMPANATONANA'),
  ('AMBATOFOTSY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Maroantsetra 1'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Maroantsetra 2  (32 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('TANAMBAO APANO'),
  ('ANJINJAKOHO'),
  ('AMBANIZANA'),
  ('MANTSOTARIHANA'),
  ('MANAMBOLO'),
  ('SAHAJINJA'),
  ('ANTAKOTAKO'),
  ('AMPANOBE'),
  ('SAHAMELOKA'),
  ('SOMISIKA'),
  ('AMPOAFAMBOAY'),
  ('NAVANA'),
  ('MAHAFIDINA II'),
  ('SAHAFOTRA'),
  ('FIZONO'),
  ('ANTETEZAMBE'),
  ('AMBIA'),
  ('AMPAFATRA'),
  ('ANDRANOFOTSY'),
  ('ANKAZOMANDROKO'),
  ('TAKOLY'),
  ('ANDONGONA'),
  ('AMBAOHELY'),
  ('SAHABOSINY'),
  ('MAINTIMBATO'),
  ('SAKATIHINA'),
  ('ANKADIBE'),
  ('MAHALEVONA'),
  ('NANDRAHANANA'),
  ('MAHAFIDINA I'),
  ('ANJOMO'),
  ('ANTSERANAMBATO')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Maroantsetra 2'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Maroantsetra 3  (13 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('MANGABE'),
  ('ANTORAKA'),
  ('MANAMBIA'),
  ('ANKOFABE'),
  ('ANTARAVATO'),
  ('AMBODIPAKA'),
  ('VODIRINA'),
  ('VODIVOHITRA'),
  ('NANDRASANA'),
  ('TANAMBAO AM/MANGA'),
  ('RENANDRANO'),
  ('ANTSAPANANDALANA'),
  ('SAHAJINJA MANONGA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Maroantsetra 3'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Moramanga 1  (21 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('ANTANAMANDROSO'),
  ('ANDOHARANO'),
  ('AMBOHITRANJAVIDY'),
  ('MANGARIVOTRA'),
  ('AMBOASARY GARA'),
  ('ANTANIFASIKA'),
  ('FIERENANA II'),
  ('ANDASIFAHATELO'),
  ('BEFORONA'),
  ('ANDRINDRA'),
  ('FIERENANA III'),
  ('AMPAHITRA'),
  ('ANALALAVA'),
  ('AMBOHIDRAY'),
  ('FIADANANA'),
  ('AMBOHIDRONONOKELY'),
  ('AMBOARABE'),
  ('BEPARASY'),
  ('ANALASOA'),
  ('ANALALA VA ATSIMO'),
  ('MAHATEHONINA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Moramanga 1'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Moramanga 2  (20 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('BETELA FITIAVANA'),
  ('AMBARILAVA'),
  ('ANTSIRINALA'),
  ('VODORIANA'),
  ('FATAKANA'),
  ('AMBODIVERO'),
  ('SABOTSY ANJIRO'),
  ('MANANKASINA'),
  ('AMBODIMANGA'),
  ('MAROVITSIKA'),
  ('AMBOHIDRONONO'),
  ('TANAMBE'),
  ('MANGABE'),
  ('AMBOHIMIADANA'),
  ('MANDIALAZA'),
  ('VOHIMIADANA'),
  ('VOHITSARA'),
  ('FIAKARANTSOA'),
  ('TANIDITRA'),
  ('ANKOKALAVA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Moramanga 2'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Sainte-Marie  (8 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('MANGALOMASO'),
  ('ANAFIAIAFY'),
  ('SAHABE'),
  ('MAROSOROKA'),
  ('AMBODIFOTATRA'),
  ('LATROZONA'),
  ('MAROMADIA'),
  ('ANTSIRAKALALANA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Sainte-Marie'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Salazamay  (24 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('SALAZAMAY'),
  ('TANAMBAO V'),
  ('TANAMAKOA'),
  ('FOULPOINTE'),
  ('TAHITY KELY'),
  ('ANJAHAMARINA'),
  ('VOHIDROTRA'),
  ('AMBALAMANASY'),
  ('RANOMENA'),
  ('AMPASIMAZAVA'),
  ('AMBODIRAFIA'),
  ('AMBODIRIANA'),
  ('AMBODIAKATRA'),
  ('AMBODIARA'),
  ('ANTETEZAMBARO'),
  ('AMBODIATAFANA'),
  ('MAROTANDRAZANA'),
  ('SAHASANDANA'),
  ('FOTSIALANANA'),
  ('ANKADIRANO'),
  ('(FONJA)'),
  ('ANALAKINININA'),
  ('AMBALAKONDRO'),
  ('ANTANAMARINA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Salazamay'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Soanierana Ivongo  (23 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('SOANIERANA IVONGO'),
  ('ANTANIFOTSY'),
  ('MAHATSARA'),
  ('AMBODIAMPANA'),
  ('MAROMANDIA'),
  ('MENATANY'),
  ('AMBATOBE'),
  ('AMBOHIMARINA'),
  ('SOSOMANGA'),
  ('AMBODIRIANA'),
  ('AMBODIRAVINA MENARA BEKETRA'),
  ('AMBOHITSARA'),
  ('SAHAJINJA'),
  ('SAVALANINA'),
  ('MAROVINANTO'),
  ('VATOMORA'),
  ('ANTANETILAVA 2'),
  ('MANOMPANA'),
  ('MORONIVO'),
  ('ANTANAMBAO'),
  ('MORAFENO'),
  ('ANTANANDAVA'),
  ('MANAKANTAFANA')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Soanierana Ivongo'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Tanambe  (22 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('TANAMBE'),
  ('AMBOHIJANAHARY'),
  ('MORAFENO'),
  ('ANTANIFOTSY'),
  ('AMBODINONOKA'),
  ('AMBALAHAZO'),
  ('AMBOHITELOTELO'),
  ('VOHITRAIVO'),
  ('AMBOHIMANARIVO'),
  ('ANDRATSIOLONA'),
  ('ANTANANDAVA'),
  ('AMBOAVORY'),
  ('SODECA'),
  ('AMBODIALA'),
  ('ANDILANA'),
  ('ANDRANOBE'),
  ('ANKAIAFO'),
  ('VOHITSARA'),
  ('ANDROMBA'),
  ('AMBODIROTRA'),
  ('VOHIMENA'),
  ('AMBODIMANGA SIVY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Tanambe'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Tsinjoarivo  (8 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('TSINJOARIVO'),
  ('BEJOFO'),
  ('MANAKAMBAHINY'),
  ('ANDILANATOBY'),
  ('ANANDROBE'),
  ('RANOFOTSY'),
  ('ANTSAPANIMAHAZO'),
  ('AMBODIAVIAVIKELY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Tsinjoarivo'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Vatomandry  (10 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('ANTANAMBAO MANAMPONTSY'),
  ('AMBODIVANDRIKA'),
  ('AMBODIARA'),
  ('MANAMPANDRANA'),
  ('VATOMANDRY'),
  ('VOHITSARA'),
  ('ILAKA'),
  ('AMBALAMANGAZO'),
  ('NIAROVANA'),
  ('MAINTINANDRY')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Vatomandry'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Vavatenina  (8 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('Vavatenina'),
  ('Sahatavy'),
  ('Maromitety'),
  ('Vohibary'),
  ('Marofinaritra'),
  ('Ambohimanjato'),
  ('Ambodimangabe'),
  ('Sahamanoro')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Vavatenina'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Maroantsetra 4  (23 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('Rantohely'),
  ('Mahasoa'),
  ('Malamavato'),
  ('Andakatombaka'),
  ('Rantabe'),
  ('Morafeno'),
  ('Renandro'),
  ('Antsampanandalana'),
  ('Tanambao'),
  ('Nanoharana'),
  ('Ambodifamelona'),
  ('Antsoraka'),
  ('Tanamaresaka'),
  ('Anandrivola'),
  ('Mahitimbato'),
  ('Ambodimanga'),
  ('Ranolalina'),
  ('Tenina'),
  ('Anivorano'),
  ('Anjialavanikoariky'),
  ('Anjiamarina'),
  ('Ampangobe'),
  ('Ankijany')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Maroantsetra 4'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Manambolosy  (25 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('Mahanoro'),
  ('Ambohitrahivo'),
  ('Madiorano'),
  ('Tenina'),
  ('Ambinanibaoka'),
  ('Andasibe'),
  ('Fanorahana'),
  ('Ambodimandresy'),
  ('Lampeny'),
  ('Manambolosy'),
  ('Mahasoa'),
  ('Andapihely'),
  ('Tanambao Tanjona'),
  ('Antangana'),
  ('Ambodimanga 2'),
  ('Sahasoa 2'),
  ('Ankoba 2'),
  ('Ambodihasina'),
  ('Marovoara'),
  ('Sahavolo'),
  ('Antsira'),
  ('Ambohosoa'),
  ('Ankorabe'),
  ('Sahavia'),
  ('Tsaratanana')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Manambolosy'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

-- Amboasary  (13 églises)
insert into eglises (district_id, nom)
select d.id, v.nom
from districts d
cross join (values
  ('Amboasary'),
  ('Andaingo'),
  ('Amboanjo'),
  ('Ambohidava'),
  ('Fierenana'),
  ('Amparihivola'),
  ('Mandrota'),
  ('Ambodirano'),
  ('Ankodahoda'),
  ('Ampasika'),
  ('Anjozoromamy'),
  ('Ranomainty'),
  ('Antanifotsy')
) as v(nom)
where lower(btrim(d.nom)) = lower(btrim('Amboasary'))
  and not exists (select 1 from eglises e where e.district_id = d.id and lower(btrim(e.nom)) = lower(btrim(v.nom)));

