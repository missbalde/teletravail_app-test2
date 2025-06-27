-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS teletravail_db;
USE teletravail_db;

-- Table des pointages
CREATE TABLE IF NOT EXISTS pointages (
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

-- Vérifier que la table a été créée
DESCRIBE pointages; 