# Camporée Manompana 2026 — Plateforme d'inscription

Application web (PWA installable) pour gérer les inscriptions de la Camporée des Juniors de Manompana.

**Stack :** React + Vite + Supabase (Auth + Postgres + RLS) + PWA. Fonctionne hors-ligne après chargement (coquille applicative en cache) ; les opérations de données nécessitent une connexion.

## Rôles

- **Admin fédération** — crée les districts et les églises (CRUD), attribue les rôles et districts aux comptes, consulte tous les membres, exporte en Excel (une feuille par église ou par district), génère les badges.
- **Responsable district** — ne voit que **son** district : inscrit les membres par église, enregistre le paiement Mobile Money, consulte les listes, contrôle les ratios d'encadrement (1 encadreur pour 4 Mpisavalalana, 1 pour 2 Mpisantatra).

Le cloisonnement par district est appliqué **côté base de données** par les politiques RLS de Supabase : un responsable ne peut techniquement pas lire ni modifier les données d'un autre district.

## Installation

### 1. Créer le projet Supabase
1. Sur https://supabase.com, créez un projet.
2. Ouvrez **SQL Editor > New query**, collez le contenu de `supabase/schema.sql`, exécutez.
3. Dans **Project Settings > API**, copiez l'URL du projet et la clé `anon public`.

### 2. Configurer l'application
```bash
npm install
cp .env.example .env
# éditez .env et renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

### 3. Lancer
```bash
npm run dev        # développement
npm run build      # build de production (dossier dist/)
npm run preview    # prévisualiser le build
```

### 4. Créer le premier administrateur
1. Lancez l'app, cliquez sur **S'inscrire**, créez votre compte (email + mot de passe).
2. Dans Supabase **SQL Editor**, exécutez (avec votre email) :
   ```sql
   update profiles set role = 'admin' where email = 'votre.email@exemple.com';
   ```
3. Reconnectez-vous : vous avez désormais accès à l'espace admin.

## Comment ça marche

- Un nouvel utilisateur qui s'inscrit a le statut **en attente** : il ne voit rien tant qu'un admin ne lui a pas attribué un rôle (et un district s'il est responsable), via l'onglet **Comptes**.
- Les frais sont fixés par catégorie (`src/lib/constants.js`) : Mpisavalalana 20 000, Mpisantatra 15 000, Encadreur 20 000, Hafa 20 000 Ar.
- Le paiement est enregistré **par église** (une délégation = un paiement), avec le type Mobile Money et la référence.

## Pistes pour la suite

- **Synchronisation hors-ligne complète** (file d'attente d'écritures via Dexie/IndexedDB) pour saisir sans réseau et synchroniser au retour.
- **Pointage à l'entrée du camp** par scan du QR des badges.
- Tableau de bord financier consolidé pour les trésoriers.

## Structure du projet

```
supabase/schema.sql          schéma + RLS
src/lib/                      supabase, constants, exports (Excel), badges (QR)
src/context/AuthContext.jsx   session + rôle + district
src/components/               Layout (barre + navigation), Toast
src/pages/Login, Pending      authentification
src/pages/admin/              Structure, Comptes, Membres, Export, Badges
src/pages/responsable/        Inscription, Listes, Encadrement
```
