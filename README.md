# ⚔️ SAOMC Builder

Un builder d'équipement complet et intuitif pour l'univers de **Sword Art Online: Minecraft Chronicle**. Créez, optimisez et partagez vos builds de personnages avec précision.

## 🚀 Fonctionnalités

- **Gestion d'équipement** : Équipez votre personnage avec des casques, plastrons, jambières, bottes, gants, accessoires (bagues, colliers) et artefacts.
- **Calcul automatique des statistiques** : Visualisez instantanément l'impact de vos équipements sur vos points de vie, dégâts, défense, mana, etc.
- **Gestion des Sets** : Détection automatique des bonus de panoplie (Sets) avec application structurée des bonus.
- **Base de données complète** : Plus de 250 items intégrés, extraits directement du jeu.
- **Interface Admin** : Une interface dédiée pour ajouter ou modifier des items et des sets en temps réel via Supabase.
- **Mode Hybride** : Fonctionne en mode local (données statiques) ou connecté (Supabase) pour une synchronisation en temps réel.

## 🛠️ Stack Technique

- **Frontend** : [Vue 3](https://vuejs.org/) (Composition API)
- **Tooling** : [Vite](https://vitejs.dev/)
- **Gestion d'état** : [Pinia](https://pinia.vuejs.org/)
- **Backend & Database** : [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Styles** : Vanilla CSS (Aesthétique SAO / RPG)

## 📦 Installation et Setup

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/saomc-builder.git
cd saomc-builder
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Copiez le fichier `.env.example` en `.env.local` et remplissez vos identifiants Supabase :
```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
VITE_ADMIN_PASSWORD=votre-mot-de-passe-admin
```

### 4. Setup de la base de données
Exécutez le contenu de `supabase-setup.sql` dans le **SQL Editor** de Supabase pour créer les tables `items` et `sets`.

### 5. Lancer le projet
```bash
npm run dev
```

## 📸 Extraction des Données

Le projet inclut un système automatisé pour peupler la base de données à partir de captures d'écran du jeu :
1. Les screenshots sont stockés dans `/stuff-screen`.
2. Un script de vision extrait les noms, statistiques, raretés et bonus de set.
3. Les données sont structurées dans `data.json`.
4. `generate_sql.py` convertit ces données en script SQL (`insert_items.sql`) prêt pour Supabase.

## 🛡️ Sécurité

- Les tables Supabase utilisent le **Row Level Security (RLS)**.
- La lecture des items est publique.
- L'écriture (Insert/Update/Delete) est protégée par un mot de passe configuré via l'interface Admin.

## 📝 Licence

Ce projet est destiné à la communauté SAO Minecraft. Tous les droits sur les images et l'univers original appartiennent à leurs auteurs respectifs.
