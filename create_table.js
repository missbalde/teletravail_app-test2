const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'teletravail_db'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
  
  // Créer la table pointages
  const createTableSQL = `
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
    )
  `;
  
  db.query(createTableSQL, (err, result) => {
    if (err) {
      console.error('Erreur création table pointages:', err);
    } else {
      console.log('✅ Table pointages créée avec succès');
    }
    
    // Vérifier la structure de la table
    db.query('DESCRIBE pointages', (err, result) => {
      if (err) {
        console.error('Erreur description table:', err);
      } else {
        console.log('📋 Structure de la table pointages:');
        console.table(result);
      }
      
      db.end();
    });
  });
}); 