const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // ou ton utilisateur MySQL
  password: '', // vide si tu n'as pas mis de mot de passe
  database: 'teletravail_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connecté à la base de données MySQL');
});

module.exports = db;
