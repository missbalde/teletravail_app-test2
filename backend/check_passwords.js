const db = require('./db');

console.log('Vérification des mots de passe des salariés...');

// Vérifier tous les employés avec leurs mots de passe
const sql = 'SELECT id, nom, prenom, email, password FROM employees';

db.query(sql, (err, results) => {
  if (err) {
    console.error('Erreur:', err);
  } else {
    console.log('Salariés et leurs mots de passe:');
    console.table(results.map(emp => ({
      id: emp.id,
      nom: emp.nom,
      prenom: emp.prenom,
      email: emp.email,
      password: emp.password || 'AUCUN MOT DE PASSE'
    })));
    
    console.log('\nPour te connecter, utilise:');
    results.forEach(emp => {
      const password = emp.password || 'password123';
      console.log(`- ${emp.email} / ${password}`);
    });
  }
  
  process.exit();
}); 