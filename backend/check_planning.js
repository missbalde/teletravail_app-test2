const db = require('./db');

console.log('Vérification des tâches dans la base de données...');

// Vérifier toutes les tâches
const sql = 'SELECT * FROM plannings';

db.query(sql, (err, result) => {
  if (err) {
    console.error('Erreur:', err);
  } else {
    console.log('Toutes les tâches:');
    console.table(result.rows);
    
    if (result.rows.length === 0) {
      console.log('\n❌ Aucune tâche trouvée dans la base de données');
    } else {
      console.log('\n✅ Tâches trouvées:', result.rows.length);
      
      // Vérifier les employés qui ont des tâches
      const employeesWithTasks = [...new Set(result.rows.map(task => task.user_id))];
      console.log('Employés avec des tâches:', employeesWithTasks);
      
      // Vérifier les tâches pour chaque employé
      employeesWithTasks.forEach(empId => {
        const tasksForEmployee = result.rows.filter(task => task.user_id === empId);
        console.log(`\nTâches pour l'employé ${empId}:`, tasksForEmployee.length);
        console.table(tasksForEmployee);
      });
    }
  }
  
  // Vérifier aussi la structure de la table
  db.query(`SELECT column_name, data_type, is_nullable, column_default
             FROM information_schema.columns
             WHERE table_name = 'plannings'`, (err, structure) => {
    if (err) {
      console.error('Erreur structure:', err);
    } else {
      console.log('\nStructure de la table plannings:');
      console.table(structure.rows);
    }
    process.exit();
  });
}); 