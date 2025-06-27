# Application de Gestion de Télétravail - Documentation Complète

## 📋 Vue d'ensemble du projet

Cette application web permet de gérer le pointage (arrivée/départ) des employés en télétravail, avec des fonctionnalités de suivi, de statistiques et de génération de fiches de temps.

### 🎯 Objectifs du projet
- Gestion des employés (CRUD)
- Système de pointage avec QR codes personnalisés
- Suivi des présences et calcul des durées
- Génération de fiches de temps (PDF/Excel)
- Interface différenciée admin/salarié
- Planning et gestion des tâches

---

## 🛠️ Technologies et outils utilisés

### Frontend
- **React 18** - Framework JavaScript pour l'interface utilisateur
- **Vite** - Outil de build et serveur de développement
- **Bootstrap 5** - Framework CSS pour le design responsive
- **Axios** - Client HTTP pour les requêtes API
- **Moment.js** - Bibliothèque de manipulation des dates
- **jsPDF** - Génération de fichiers PDF
- **SheetJS (xlsx)** - Génération de fichiers Excel
- **React Router** - Navigation entre les pages

### Backend
- **Node.js** - Runtime JavaScript côté serveur
- **Express.js** - Framework web pour l'API REST
- **SQLite3** - Base de données légère et portable
- **bcrypt** - Hachage des mots de passe
- **CORS** - Gestion des requêtes cross-origin

### Outils de développement
- **Git** - Contrôle de version
- **npm** - Gestionnaire de paquets
- **ESLint** - Linting du code JavaScript
- **Postman/Thunder Client** - Test des API

---

## 📁 Structure du projet

```
teletravail_app/
├── backend/                 # Serveur Node.js/Express
│   ├── index.js            # Point d'entrée du serveur
│   ├── db.js               # Configuration base de données
│   ├── employees.js        # Routes gestion employés
│   ├── pointage.js         # Routes gestion pointages
│   ├── planning.js         # Routes gestion planning
│   └── package.json        # Dépendances backend
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── contexts/       # Contextes (AuthContext)
│   │   ├── pages/          # Pages principales
│   │   └── main.jsx        # Point d'entrée React
│   ├── package.json        # Dépendances frontend
│   └── vite.config.js      # Configuration Vite
└── README.md               # Documentation
```

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Git

### Installation

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd teletravail_app
```

2. **Installation des dépendances backend**
```bash
cd backend
npm install
```

3. **Installation des dépendances frontend**
```bash
cd ../frontend
npm install
```

### Démarrage

1. **Démarrer le serveur backend**
```bash
cd backend
npm start
# Le serveur démarre sur http://localhost:4000
```

2. **Démarrer l'application frontend**
```bash
cd frontend
npm run dev
# L'application démarre sur http://localhost:5173
```

---

## 🗄️ Configuration de la base de données

### Création des tables

Le fichier `database_setup.sql` contient la structure de la base de données :

```sql
-- Table des employés
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    poste TEXT,
    telephone TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'salarie'
);

-- Table des pointages
CREATE TABLE pointages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date_pointage DATE NOT NULL,
    heure_pointage TIME NOT NULL,
    type_pointage TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    FOREIGN KEY (employee_id) REFERENCES employees (id)
);

-- Table du planning
CREATE TABLE plannings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    task TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES employees (id)
);
```

### Initialisation
```bash
cd backend
node create_table.js
```

---

## 🔧 Développement étape par étape

### Phase 1 : Structure de base
1. **Création du projet**
   - Initialisation du backend Express
   - Configuration de la base de données SQLite
   - Création des routes de base

2. **Interface utilisateur**
   - Setup React avec Vite
   - Configuration Bootstrap
   - Création des composants de base

### Phase 2 : Gestion des employés
1. **Backend**
   - Routes CRUD pour les employés
   - Hachage des mots de passe avec bcrypt
   - Validation des données

2. **Frontend**
   - Formulaire d'ajout/modification d'employés
   - Liste des employés avec actions
   - Interface admin/salarié

### Phase 3 : Système de pointage
1. **Backend**
   - Routes pour enregistrer les pointages
   - Gestion des types (arrivée/départ)
   - Support de la géolocalisation

2. **Frontend**
   - Interface de pointage (BadgeusePage)
   - Suivi des pointages (PointageView)
   - Statistiques en temps réel

### Phase 4 : QR Codes
1. **Génération des QR codes**
   - Utilisation de l'API qrserver.com
   - QR codes personnalisés par employé
   - Téléchargement des QR codes

2. **Pointage par QR**
   - Page de pointage accessible via QR
   - Capture automatique de la géolocalisation
   - Interface mobile-friendly

### Phase 5 : Statistiques et rapports
1. **Calculs automatiques**
   - Durée moyenne des sessions
   - Nombre de présences
   - Sessions complétées

2. **Génération de fiches**
   - Export PDF avec jsPDF
   - Export Excel avec SheetJS
   - Filtrage par mois/année

### Phase 6 : Améliorations et optimisations
1. **Interface utilisateur**
   - Filtres par date/mois
   - Affichage de tous les pointages
   - Modales de sélection

2. **Fonctionnalités avancées**
   - Planning des tâches
   - Gestion des rôles
   - Sécurité renforcée

---

## 🔐 Système d'authentification

### Rôles utilisateurs
- **Admin** : Accès complet à toutes les fonctionnalités
- **Salarié** : Accès limité à ses propres données

### Gestion des sessions
- Utilisation du Context API React
- Stockage local des informations utilisateur
- Protection des routes sensibles

---

## 📊 Fonctionnalités principales

### Pour l'administrateur
- ✅ Gestion complète des employés (CRUD)
- ✅ Suivi des pointages de tous les employés
- ✅ Statistiques globales et par employé
- ✅ Génération de fiches de temps par mois
- ✅ Gestion du planning des tâches
- ✅ Export PDF/Excel pour chaque employé

### Pour le salarié
- ✅ Consultation de ses propres pointages
- ✅ Filtrage par mois
- ✅ Statistiques personnelles
- ✅ QR code personnel pour pointage
- ✅ Consultation du planning

### Fonctionnalités communes
- ✅ Pointage par interface web
- ✅ Pointage par QR code
- ✅ Géolocalisation automatique
- ✅ Calcul automatique des durées

---

## 🌐 Déploiement

### Développement local
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### Production
1. **Build du frontend**
```bash
cd frontend
npm run build
```

2. **Configuration du serveur**
- Installer Node.js sur le serveur
- Copier les fichiers backend
- Configurer les variables d'environnement
- Démarrer avec PM2 ou Docker

### Variables d'environnement
```env
PORT=4000
DB_PATH=./database.sqlite
JWT_SECRET=your-secret-key
```

---

## 🔧 Commandes utiles

### Backend
```bash
# Démarrer le serveur
npm start

# Démarrer en mode développement
npm run dev

# Créer les tables
node create_table.js

# Tester la base de données
node test_db.js
```

### Frontend
```bash
# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

### Base de données
```bash
# Accéder à SQLite
sqlite3 database.sqlite

# Voir les tables
.tables

# Voir la structure d'une table
.schema employees
```

---

## 🐛 Résolution de problèmes

### Problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifier que le fichier database.sqlite existe
   - Vérifier les permissions du dossier

2. **Erreur CORS**
   - Vérifier la configuration CORS dans le backend
   - S'assurer que les URLs correspondent

3. **QR codes non accessibles**
   - Vérifier l'URL dans le QR code
   - S'assurer que le serveur est accessible depuis le mobile

4. **Géolocalisation non fonctionnelle**
   - Vérifier les permissions du navigateur
   - Tester sur HTTPS en production

---

## 📈 Évolutions futures

### Fonctionnalités à ajouter
- [ ] Notifications push
- [ ] Validation des horaires de travail
- [ ] Gestion des congés
- [ ] Tableau de bord avancé
- [ ] API mobile native
- [ ] Intégration avec des systèmes RH

### Améliorations techniques
- [ ] Tests automatisés
- [ ] Documentation API (Swagger)
- [ ] Monitoring et logs
- [ ] Cache Redis
- [ ] Base de données PostgreSQL

---

## 👥 Contribution

### Standards de code
- Utiliser ESLint pour le linting
- Suivre les conventions React
- Commenter le code complexe
- Tester les nouvelles fonctionnalités

### Processus de développement
1. Créer une branche pour chaque fonctionnalité
2. Développer et tester localement
3. Créer une pull request
4. Code review et merge

---

## 📞 Support

Pour toute question ou problème :
- Vérifier la documentation
- Consulter les logs d'erreur
- Tester en environnement de développement
- Contacter l'équipe de développement

---

*Documentation mise à jour le : [Date]*
*Version du projet : 1.0.0* 