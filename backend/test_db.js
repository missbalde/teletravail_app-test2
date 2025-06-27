const db = require('./db');

console.log('Test de la base de données...');

// Vérifier la structure de la table employees
db.query('DESCRIBE employees', (err, results) => {
  if (err) {
    console.error('Erreur lors de la description de la table:', err);
  } else {
    console.log('Structure de la table employees:');
    console.table(results);
  }
  
  // Vérifier les données existantes
  db.query('SELECT id, nom, prenom, email FROM employees LIMIT 3', (err, results) => {
    if (err) {
      console.error('Erreur lors de la sélection:', err);
    } else {
      console.log('Données existantes:');
      console.table(results);
    }
    
    process.exit();
  });
}); 