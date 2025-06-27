# Système de Pointage - Application de Télétravail

## 🎯 Fonctionnalités du Système de Pointage

### 1. **Badgeuse Virtuelle** 
- Interface tactile moderne pour le pointage des employés
- Sélection visuelle de l'employé par carte d'identité
- Horloge en temps réel
- Boutons d'arrivée et de départ

### 2. **Pointage Administrateur**
- Interface de gestion pour les administrateurs
- Vue d'ensemble du statut des employés
- Historique complet des pointages
- Possibilité de supprimer des pointages

### 3. **Statut en Temps Réel**
- Affichage du statut actuel de chaque employé :
  - 🟢 **Présent** : Pointage d'arrivée effectué
  - 🔴 **Absent** : Aucun pointage aujourd'hui
  - 🟡 **Parti** : Pointage de départ effectué

## 🗄️ Structure de la Base de Données

### Table `pointages`
```sql
CREATE TABLE pointages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date_pointage DATE NOT NULL,
    heure_pointage TIME NOT NULL,
    type_pointage ENUM('arrivee', 'depart') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_date (employee_id, date_pointage),
    INDEX idx_date_type (date_pointage, type_pointage)
);
```

## 🚀 Installation et Configuration

### 1. **Configuration de la Base de Données**
```bash
# Exécuter le script SQL
mysql -u root -p < database_setup.sql
```

### 2. **Démarrer le Backend**
```bash
cd backend
npm install
npm start
```

### 3. **Démarrer le Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 📱 Utilisation

### **Pour les Employés (Badgeuse)**
1. Aller dans l'onglet **"Badgeuse"**
2. Cliquer sur votre carte d'identité
3. Cliquer sur **"POINTER L'ARRIVÉE"** ou **"POINTER LE DÉPART"**

### **Pour les Administrateurs**
1. **Onglet "Pointage Admin"** : Gestion complète des pointages
2. **Onglet "Badgeuse"** : Interface de pointage pour les employés
3. **Onglet "Gestion Employés"** : Ajouter/modifier les employés

## 🔧 API Endpoints

### Pointages
- `GET /api/pointages` - Liste tous les pointages
- `GET /api/pointages/employee/:id` - Pointages d'un employé
- `GET /api/pointages/today/:id` - Pointages du jour pour un employé
- `POST /api/pointages` - Enregistrer un pointage
- `DELETE /api/pointages/:id` - Supprimer un pointage

### Paramètres POST pour un pointage
```json
{
  "employee_id": 1,
  "type_pointage": "arrivee" // ou "depart"
}
```

## 🛡️ Sécurité et Validation

### Contrôles Automatiques
- ✅ Vérification de l'existence de l'employé
- ✅ Empêche les doublons de pointage (même type le même jour)
- ✅ Horodatage automatique des pointages
- ✅ Validation des données côté serveur

### Messages d'Erreur
- "Employé non trouvé"
- "Pointage arrivée déjà enregistré aujourd'hui pour cet employé"
- "Pointage départ déjà enregistré aujourd'hui pour cet employé"

## 🎨 Interface Utilisateur

### Badgeuse Virtuelle
- Design moderne avec cartes d'identité
- Horloge en temps réel
- Boutons tactiles grands et accessibles
- Feedback visuel immédiat

### Pointage Administrateur
- Tableau de bord avec statuts
- Historique complet
- Actions de suppression
- Interface responsive

## 🔄 Fonctionnalités Avancées

### Statut Automatique
Le système calcule automatiquement le statut de chaque employé :
- **Absent** : Aucun pointage aujourd'hui
- **Présent** : Pointage d'arrivée sans départ
- **Parti** : Pointage d'arrivée + départ

### Historique Complet
- Tous les pointages avec date et heure
- Tri par date/heure décroissante
- Affichage formaté en français

## 🚀 Améliorations Possibles

1. **Authentification par badge RFID**
2. **Géolocalisation pour télétravail**
3. **Notifications push**
4. **Rapports et statistiques**
5. **Export des données**
6. **Intégration avec la paie**

## 📞 Support

Pour toute question ou problème avec le système de pointage, consultez la documentation ou contactez l'équipe technique. 