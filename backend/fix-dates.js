const db = require('./db');
const moment = require('moment-timezone');

console.log('🔧 Correction des dates dans la base de données...');

// Fonction pour corriger une date UTC en date locale
function fixDate(utcDate) {
  if (!utcDate) return null;
  
  // Convertir UTC en Europe/Paris
  const localDate = moment.utc(utcDate).tz('Europe/Paris').format('YYYY-MM-DD');
  console.log(`Date corrigée: ${utcDate} -> ${localDate}`);
  return localDate;
}

// Récupérer tous les pointages
const sql = 'SELECT * FROM pointages ORDER BY id';
db.query(sql, (err, results) => {
  if (err) {
    console.error('Erreur récupération pointages:', err);
    return;
  }

  console.log(`📊 ${results.length} pointages trouvés`);

  results.forEach(pointage => {
    const oldDate = pointage.date_pointage;
    const newDate = fixDate(oldDate);
    
    if (newDate && newDate !== oldDate) {
      // Mettre à jour la date
      const updateSql = 'UPDATE pointages SET date_pointage = ? WHERE id = ?';
      db.query(updateSql, [newDate, pointage.id], (err, result) => {
        if (err) {
          console.error(`❌ Erreur mise à jour pointage ${pointage.id}:`, err);
        } else {
          console.log(`✅ Pointage ${pointage.id} mis à jour: ${oldDate} -> ${newDate}`);
        }
      });
    }
  });

  console.log('🎉 Correction terminée !');
  process.exit(0);
}); 