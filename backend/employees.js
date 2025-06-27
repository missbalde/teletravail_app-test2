const express = require('express');
const router = express.Router();
const db = require('./db'); // Fichier de connexion à MySQL

// 🔹 GET - Liste de tous les salariés
router.get('/', (req, res) => {
  db.query('SELECT id, nom, prenom, email, poste, telephone FROM employees', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 🔹 POST - Ajouter un salarié
router.post('/', (req, res) => {
  const { nom, prenom, email, poste, telephone, password } = req.body;
  const sql = 'INSERT INTO employees (nom, prenom, email, poste, telephone, password) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nom, prenom, email, poste, telephone, password || 'password123'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, nom, prenom, email, poste, telephone });
  });
});

// 🔹 PUT - Modifier un salarié (par ID)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, poste, telephone, password } = req.body;
  
  console.log('Modification employé - ID:', id);
  console.log('Données reçues:', { nom, prenom, email, poste, telephone, password: password ? '***' : 'non fourni' });
  
  let sql, params;
  
  if (password) {
    // Si un nouveau mot de passe est fourni
    sql = 'UPDATE employees SET nom = ?, prenom = ?, email = ?, poste = ?, telephone = ?, password = ? WHERE id = ?';
    params = [nom, prenom, email, poste, telephone, password, id];
  } else {
    // Si aucun mot de passe n'est fourni, ne pas le modifier
    sql = 'UPDATE employees SET nom = ?, prenom = ?, email = ?, poste = ?, telephone = ? WHERE id = ?';
    params = [nom, prenom, email, poste, telephone, id];
  }

  console.log('SQL:', sql);
  console.log('Paramètres:', params);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erreur base de données:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log('Résultat de la requête:', result);
    
    if (result.affectedRows === 0) {
      console.log('Aucune ligne affectée - employé non trouvé');
      return res.status(404).json({ message: 'Salarié non trouvé' });
    }
    
    console.log('Employé mis à jour avec succès');
    res.json({ message: 'Salarié mis à jour avec succès' });
  });
});

// 🔹 DELETE - Supprimer un salarié (par ID)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM employees WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Salarié non trouvé' });
    }
    res.json({ message: 'Salarié supprimé avec succès' });
  });
});

module.exports = router;
