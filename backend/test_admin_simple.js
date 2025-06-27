const http = require('http');

function testAdminLogin() {
  console.log('Test de connexion admin...');
  
  const postData = JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Réponse:', response);
        
        if (res.statusCode === 200) {
          console.log('✅ Connexion admin réussie !');
          console.log('Token:', response.token ? 'Présent' : 'Absent');
          console.log('User:', response.user);
        } else {
          console.log('❌ Échec de la connexion admin');
        }
      } catch (error) {
        console.log('Réponse brute:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Erreur de connexion:', error.message);
    console.log('Assurez-vous que le serveur backend est démarré sur le port 4000');
  });

  req.write(postData);
  req.end();
}

// Test avec des identifiants incorrects
function testWrongCredentials() {
  console.log('\nTest avec des identifiants incorrects...');
  
  const postData = JSON.stringify({
    email: 'admin@example.com',
    password: 'wrongpassword'
  });

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Réponse:', response);
      } catch (error) {
        console.log('Réponse brute:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Erreur de connexion:', error.message);
  });

  req.write(postData);
  req.end();
}

// Exécuter les tests
testAdminLogin();
setTimeout(testWrongCredentials, 1000); 