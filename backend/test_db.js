const db = require('./db');

console.log('Test de la base de données...');

// Vérifier la structure de la table employees (PostgreSQL)
db.query(`SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns
           WHERE table_name = 'employees'`, (err, results) => {
  if (err) {
    console.error('Erreur lors de la description de la table:', err);
  } else {
    console.log('Structure de la table employees:');
    console.table(results);
  }

  // Vérifier les données existantes
  db.query('SELECT id, nom, prenom, email FROM employees LIMIT 3', (err, results2) => {
    if (err) {
      console.error('Erreur lors de la sélection:', err);
    } else {
      console.log('Données existantes:');
      console.table(results2);
    }
    process.exit();
  });
}); 