require('dotenv').config();
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[OK]' : '[MISSING]');
console.log('DB_NAME:', process.env.DB_NAME);
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }, // Obligatoire pour Supabase
  family: 4 // Forcer IPv4
});

pool.connect((err) => {
  if (err) throw err;
  console.log('Connecté à la base de données PostgreSQL (Supabase)');
});

module.exports = pool;
