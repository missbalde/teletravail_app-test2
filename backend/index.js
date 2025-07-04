const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 4000;
const SECRET_KEY = 'monsecretpourjwt'; // Change cette clé en production

app.use(cors());
app.use(express.json());

// Utilisateur admin mock
const adminUser = {
  id: 1,
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  nom: 'Administrateur'
};

//Route de connexion 
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Chercher l'utilisateur dans la base
  const sql = 'SELECT * FROM employees WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Erreur base de données:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length > 0) {
      const user = results[0];
      const token = jwt.sign({ 
        id: user.id, 
        email: user.email, 
        role: user.role,
        nom: `${user.nom} ${user.prenom}`,
        employee_id: user.id
      }, SECRET_KEY, { expiresIn: '1h' });
      
      return res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          nom: `${user.nom} ${user.prenom}`,
          employee_id: user.id
        } 
      });
    }

    res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  });
});

// Middleware pour vérifier le token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Route pour récupérer les infos de l'utilisateur connecté
app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Routes
const employeesRoutes = require('./employees');
app.use('/api/employees', employeesRoutes);

const planningRoutes = require('./planning');
app.use('/api/plannings', planningRoutes);

const pointageRoutes = require('./pointage');
app.use('/api/pointages', pointageRoutes);

// Lancement du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

