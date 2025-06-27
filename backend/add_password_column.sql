-- Ajouter la colonne password à la table employees
ALTER TABLE employees ADD COLUMN password VARCHAR(255) DEFAULT 'password123';

-- Mettre à jour les mots de passe existants (optionnel)
-- UPDATE employees SET password = 'password123' WHERE password IS NULL;

-- Afficher la structure de la table
DESCRIBE employees; 