const db = require('./db');

console.log('Vérification des tâches dans la base de données...');

// Vérifier toutes les tâches
const sql = 'SELECT * FROM plannings';

db.query(sql, (err, results) => {
  if (err) {
    console.error('Erreur:', err);
  } else {
    console.log('Toutes les tâches:');
    console.table(results);
    
    if (results.length === 0) {
      console.log('\n❌ Aucune tâche trouvée dans la base de données');
    } else {
      console.log('\n✅ Tâches trouvées:', results.length);
      
      // Vérifier les employés qui ont des tâches
      const employeesWithTasks = [...new Set(results.map(task => task.employee_id))];
      console.log('Employés avec des tâches:', employeesWithTasks);
      
      // Vérifier les tâches pour chaque employé
      employeesWithTasks.forEach(empId => {
        const tasksForEmployee = results.filter(task => task.employee_id === empId);
        console.log(`\nTâches pour l'employé ${empId}:`, tasksForEmployee.length);
        console.table(tasksForEmployee);
      });
    }
  }
  
  // Vérifier aussi la structure de la table
  db.query('DESCRIBE plannings', (err, structure) => {
    if (err) {
      console.error('Erreur structure:', err);
    } else {
      console.log('\nStructure de la table plannings:');
      console.table(structure);
    }
    process.exit();
  });
}); 