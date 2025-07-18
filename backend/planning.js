const express = require('express');
const router = express.Router();
const db = require('./db'); // connexion à PostgreSQL

// 🔹 GET - Récupérer tous les plannings avec nom + prénom
router.get('/', (req, res) => {
  const sql = `
    SELECT p.*, e.nom, e.prenom 
    FROM plannings p 
    JOIN employees e ON p.user_id = e.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("ERREUR SQL :", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 🔹 POST - Ajouter un planning
router.post('/', (req, res) => {
  const { user_id, date, start_time, end_time, task } = req.body;
  const sql = `
    INSERT INTO plannings (user_id, date, start_time, end_time, task)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [user_id, date, start_time, end_time, task], (err, result) => {
    if (err) {
      console.error("ERREUR INSERT :", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, user_id, date, start_time, end_time, task });
  });
});

// 🔹 PUT - Modifier un planning
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { user_id, date, start_time, end_time, task } = req.body;
  const sql = `
    UPDATE plannings
    SET user_id = ?, date = ?, start_time = ?, end_time = ?, task = ?
    WHERE id = ?
  `;
  db.query(sql, [user_id, date, start_time, end_time, task, id], (err, result) => {
    if (err) {
      console.error("ERREUR UPDATE :", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    res.json({ message: 'Tâche modifiée avec succès' });
  });
});

// 🔹 DELETE - Supprimer un planning
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM plannings WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("ERREUR DELETE :", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    res.json({ message: 'Tâche supprimée avec succès' });
  });
});

module.exports = router;
