const fetch = require('node-fetch');

async function testAdminLogin() {
  console.log('Test de connexion admin...');
  
  try {
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Réponse:', data);
    
    if (response.ok) {
      console.log('✅ Connexion admin réussie !');
      console.log('Token:', data.token ? 'Présent' : 'Absent');
      console.log('User:', data.user);
    } else {
      console.log('❌ Échec de la connexion admin');
    }
  } catch (error) {
    console.error('Erreur lors du test:', error.message);
  }
}

// Test aussi avec des données incorrectes
async function testWrongCredentials() {
  console.log('\nTest avec des identifiants incorrects...');
  
  try {
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'wrongpassword'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Réponse:', data);
  } catch (error) {
    console.error('Erreur lors du test:', error.message);
  }
}

// Exécuter les tests
testAdminLogin().then(() => {
  testWrongCredentials();
}); 