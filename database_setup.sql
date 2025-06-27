-- Script de configuration de la base de données pour l'application de télétravail
-- À exécuter dans MySQL pour créer les tables nécessaires

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS teletravail_db;
USE teletravail_db;

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    poste VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des plannings
CREATE TABLE IF NOT EXISTS plannings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    task TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Table des pointages
CREATE TABLE IF NOT EXISTS pointages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date_pointage DATE NOT NULL,
    heure_pointage TIME NOT NULL,
    type_pointage ENUM('arrivee', 'depart') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    -- Index pour optimiser les requêtes
    INDEX idx_employee_date (employee_id, date_pointage),
    INDEX idx_date_type (date_pointage, type_pointage)
);

-- Insérer quelques employés de test
INSERT INTO employees (nom, prenom, email, poste, telephone) VALUES
('Dupont', 'Jean', 'jean.dupont@entreprise.com', 'Développeur', '+33 6 12 34 56 78'),
('Martin', 'Marie', 'marie.martin@entreprise.com', 'Designer', '+33 6 23 45 67 89'),
('Bernard', 'Pierre', 'pierre.bernard@entreprise.com', 'Chef de projet', '+33 6 34 56 78 90'),
('Petit', 'Sophie', 'sophie.petit@entreprise.com', 'Marketing', '+33 6 45 67 89 01'),
('Robert', 'Lucas', 'lucas.robert@entreprise.com', 'RH', '+33 6 56 78 90 12');

-- Insérer quelques plannings de test
INSERT INTO plannings (user_id, date, start_time, end_time, task) VALUES
(1, CURDATE(), '09:00:00', '12:00:00', 'Développement frontend'),
(1, CURDATE(), '14:00:00', '17:00:00', 'Réunion équipe'),
(2, CURDATE(), '08:30:00', '11:30:00', 'Design maquettes'),
(3, CURDATE(), '10:00:00', '12:00:00', 'Planning sprint'),
(4, CURDATE(), '09:00:00', '16:00:00', 'Campagne marketing');

-- Insérer quelques pointages de test pour aujourd'hui
INSERT INTO pointages (employee_id, date_pointage, heure_pointage, type_pointage) VALUES
(1, CURDATE(), '08:45:00', 'arrivee'),
(2, CURDATE(), '08:30:00', 'arrivee'),
(3, CURDATE(), '09:00:00', 'arrivee'),
(4, CURDATE(), '08:55:00', 'arrivee'),
(1, CURDATE(), '17:30:00', 'depart'),
(2, CURDATE(), '17:45:00', 'depart');

-- Afficher les tables créées
SHOW TABLES;

-- Afficher la structure de la table pointages
DESCRIBE pointages; 