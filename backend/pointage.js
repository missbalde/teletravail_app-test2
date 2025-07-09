const express = require('express');
const router = express.Router();
const db = require('./db');
const moment = require('moment-timezone');

// Fonction pour obtenir la date locale en format YYYY-MM-DD
function getLocalDate() {
  const date = moment().tz('Europe/Paris').format('YYYY-MM-DD');
  console.log('Date locale (moment):', date);
  return date;
}

// Fonction pour obtenir l'heure locale en format HH:MM:SS
function getLocalTime() {
  const time = moment().tz('Europe/Paris').format('HH:mm:ss');
  console.log('Heure locale (moment):', time);
  return time;
}

// 🔹 GET - Récupérer tous les pointages avec nom + prénom
router.get('/', (req, res) => {
  const sql = `
    SELECT p.*, e.nom, e.prenom 
    FROM pointages p 
    JOIN employees e ON p.employee_id = e.id
    ORDER BY p.date_pointage DESC, p.heure_pointage DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("ERREUR SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 GET - Récupérer les pointages d'un employé spécifique
router.get('/employee/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const sql = `
    SELECT p.*, e.nom, e.prenom 
    FROM pointages p 
    JOIN employees e ON p.employee_id = e.id
    WHERE p.employee_id = ?
    ORDER BY p.date_pointage DESC, p.heure_pointage DESC
  `;
  db.query(sql, [employeeId], (err, results) => {
    if (err) {
      console.error("ERREUR SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 GET - Récupérer le pointage du jour pour un employé
router.get('/today/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const today = getLocalDate();
  
  const sql = `
    SELECT p.*, e.nom, e.prenom 
    FROM pointages p 
    JOIN employees e ON p.employee_id = e.id
    WHERE p.employee_id = ? AND p.date_pointage = ?
    ORDER BY p.heure_pointage ASC
  `;
  db.query(sql, [employeeId, today], (err, results) => {
    if (err) {
      console.error("ERREUR SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 POST - Enregistrer un pointage (arrivée ou départ)
router.post('/', (req, res) => {
  const { employee_id, type_pointage } = req.body;
  
  if (!employee_id || !type_pointage) {
    return res.status(400).json({ error: 'employee_id et type_pointage sont requis' });
  }

  const date_pointage = getLocalDate();
  const heure_pointage = getLocalTime();

  console.log('Enregistrement pointage:', { employee_id, date_pointage, heure_pointage, type_pointage });

  console.log(`=== NOUVEAU POINTAGE ===`);
  console.log(`Date locale: ${date_pointage}`);
  console.log(`Heure locale: ${heure_pointage}`);
  console.log(`Type: ${type_pointage}`);
  console.log(`Employé ID: ${employee_id}`);
  console.log(`========================`);

  // Vérifier si l'employé existe
  db.query('SELECT * FROM employees WHERE id = ?', [employee_id], (err, results) => {
    if (err) {
      console.error("ERREUR VÉRIFICATION EMPLOYÉ :", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    // Vérifier si un pointage du même type existe déjà aujourd'hui
    const checkSql = `
      SELECT * FROM pointages 
      WHERE employee_id = ? AND date_pointage = ? AND type_pointage = ?
    `;
    
    db.query(checkSql, [employee_id, date_pointage, type_pointage], (err, existingResults) => {
      if (err) {
        console.error("ERREUR VÉRIFICATION POINTAGE :", err);
        return res.status(500).json({ error: err.message });
      }

      if (existingResults.length > 0) {
        return res.status(400).json({ 
          error: `Pointage ${type_pointage} déjà enregistré aujourd'hui pour cet employé` 
        });
      }

      // Enregistrer le pointage
      const insertSql = `
        INSERT INTO pointages (employee_id, date_pointage, heure_pointage, type_pointage)
        VALUES (?, ?, ?, ?)
      `;
      
      db.query(insertSql, [employee_id, date_pointage, heure_pointage, type_pointage], (err, result) => {
        if (err) {
          console.error("ERREUR INSERT POINTAGE :", err);
          return res.status(500).json({ error: err.message });
        }
        
        console.log(`✅ Pointage enregistré avec succès - ID: ${result.insertId}`);
        
        res.status(201).json({ 
          id: result.insertId, 
          employee_id, 
          date_pointage, 
          heure_pointage, 
          type_pointage,
          message: `Pointage ${type_pointage} enregistré avec succès`
        });
      });
    });
  });
});

// 🔹 DELETE - Supprimer un pointage (admin seulement)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM pointages WHERE id = ?`;
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("ERREUR DELETE :", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pointage non trouvé' });
    }
    console.log(`🗑️ Pointage supprimé - ID: ${id}`);
    res.json({ message: 'Pointage supprimé avec succès' });
  });
});

// Route pour le pointage via QR code (public)
router.post('/qr', (req, res) => {
  const { employee_id, latitude, longitude } = req.body;
  if (!employee_id) {
    return res.status(400).json({ error: 'employee_id manquant.' });
  }

  // Date du jour (format YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // Récupérer les pointages du jour pour ce salarié
  db.query(
    'SELECT * FROM pointages WHERE employee_id = ? AND date_pointage = ?',
    [employee_id, today],
    (err, pointages) => {
      if (err) {
        console.error('Erreur pointage QR:', err);
        return res.status(500).json({ error: 'Erreur serveur lors du pointage.' });
      }

      // Déterminer le type de pointage
      let type_pointage = 'arrivee';
      if (pointages.some(p => p.type_pointage === 'arrivee' || p.type_pointage === 'arrivée')) {
        type_pointage = 'depart';
      }

      // Heure actuelle (Europe/Paris)
      const heure_pointage = moment().tz('Europe/Paris').format('HH:mm:ss');

      // Enregistrer le pointage (avec ou sans latitude/longitude)
      let sql, params;
      if (req.body.hasOwnProperty('latitude') && req.body.hasOwnProperty('longitude')) {
        sql = 'INSERT INTO pointages (employee_id, date_pointage, heure_pointage, type_pointage, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)';
        params = [employee_id, today, heure_pointage, type_pointage, latitude, longitude];
      } else {
        sql = 'INSERT INTO pointages (employee_id, date_pointage, heure_pointage, type_pointage) VALUES (?, ?, ?, ?)';
        params = [employee_id, today, heure_pointage, type_pointage];
      }
      db.query(sql, params, (err, result) => {
        if (err) {
          console.error('Erreur pointage QR:', err);
          return res.status(500).json({ error: 'Erreur serveur lors du pointage.' });
        }
        res.json({ message: `Pointage "${type_pointage}" enregistré avec succès !` });
      });
    }
  );
});

module.exports = router; 