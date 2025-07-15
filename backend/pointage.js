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
    console.log('Résultats SQL pointages:', results);
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
    WHERE p.employee_id = $1
    ORDER BY p.date_pointage DESC, p.heure_pointage DESC
  `;
  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error("ERREUR SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows);
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
    WHERE p.employee_id = $1 AND p.date_pointage = $2
    ORDER BY p.heure_pointage ASC
  `;
  db.query(sql, [employeeId, today], (err, result) => {
    if (err) {
      console.error("ERREUR SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows);
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
  db.query('SELECT * FROM employees WHERE id = $1', [employee_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    const checkSql = `SELECT * FROM pointages WHERE employee_id = $1 AND date_pointage = $2 AND type_pointage = $3`;
    db.query(checkSql, [employee_id, date_pointage, type_pointage], (err, existingResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (existingResults.rows.length > 0) {
        return res.status(400).json({ error: `Pointage ${type_pointage} déjà enregistré aujourd'hui pour cet employé` });
      }
      const insertSql = `INSERT INTO pointages (employee_id, date_pointage, heure_pointage, type_pointage) VALUES ($1, $2, $3, $4) RETURNING id`;
      db.query(insertSql, [employee_id, date_pointage, heure_pointage, type_pointage], (err, insertResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          id: insertResult.rows[0].id,
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
  const sql = `DELETE FROM pointages WHERE id = $1`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pointage non trouvé' });
    }
    res.json({ message: 'Pointage supprimé avec succès' });
  });
});

// Route pour le pointage via QR code (public)
router.post('/qr', (req, res) => {
  const { employee_id, latitude, longitude } = req.body;
  if (!employee_id) {
    return res.status(400).json({ error: 'employee_id manquant.' });
  }
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    'SELECT * FROM pointages WHERE employee_id = $1 AND date_pointage = $2',
    [employee_id, today],
    (err, pointages) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur lors du pointage.' });
      }
      let type_pointage = 'arrivee';
      if (pointages.rows.some(p => p.type_pointage === 'arrivee' || p.type_pointage === 'arrivée')) {
        type_pointage = 'depart';
      }
      const heure_pointage = moment().tz('Europe/Paris').format('HH:mm:ss');
      let sql, params;
      if (req.body.hasOwnProperty('latitude') && req.body.hasOwnProperty('longitude')) {
        sql = 'INSERT INTO pointages (employee_id, date_pointage, heure_pointage, type_pointage, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        params = [employee_id, today, heure_pointage, type_pointage, latitude, longitude];
      } else {
        sql = 'INSERT INTO pointages (employee_id, date_pointage, heure_pointage, type_pointage) VALUES ($1, $2, $3, $4) RETURNING id';
        params = [employee_id, today, heure_pointage, type_pointage];
      }
      db.query(sql, params, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur lors du pointage.' });
        }
        res.json({ message: `Pointage "${type_pointage}" enregistré avec succès !` });
      });
    }
  );
});

module.exports = router; 