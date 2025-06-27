const db = require('./db');

console.log('Ajout de la colonne password...');

// Ajouter la colonne password
const sql = 'ALTER TABLE employees ADD COLUMN password VARCHAR(255) DEFAULT "password123"';

db.query(sql, (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('La colonne password existe déjà');
    } else {
      console.error('Erreur lors de l\'ajout de la colonne:', err);
    }
  } else {
    console.log('Colonne password ajoutée avec succès');
  }
  
  // Vérifier la nouvelle structure
  db.query('DESCRIBE employees', (err, results) => {
    if (err) {
      console.error('Erreur lors de la description:', err);
    } else {
      console.log('Nouvelle structure de la table:');
      console.table(results);
    }
    
    // Mettre à jour les mots de passe existants
    db.query('UPDATE employees SET password = "password123" WHERE password IS NULL OR password = ""', (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour des mots de passe:', err);
      } else {
        console.log('Mots de passe mis à jour pour', result.affectedRows, 'employés');
      }
      
      process.exit();
    });
  });
}); 