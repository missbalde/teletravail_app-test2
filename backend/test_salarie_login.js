const http = require('http');

function testSalarieLogin(email, password) {
  console.log(`Test de connexion salarié: ${email}`);
  
  const postData = JSON.stringify({
    email: email,
    password: password
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
          console.log('✅ Connexion salarié réussie !');
          console.log('Role:', response.user.role);
          console.log('Nom:', response.user.nom);
          console.log('Employee ID:', response.user.employee_id);
        } else {
          console.log('❌ Échec de la connexion salarié');
        }
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

// Test avec différents salariés
console.log('=== Test de connexion des salariés ===\n');

// Test 1: baldeyaye10@gmail.com
testSalarieLogin('baldeyaye10@gmail.com', 'password123');

setTimeout(() => {
  // Test 2: haria@gmail.com (mot de passe personnalisé)
  testSalarieLogin('haria@gmail.com', 'haria1234');
}, 1000);

setTimeout(() => {
  // Test 3: email incorrect
  testSalarieLogin('baldeyaye10@gmail.com', 'wrongpassword');
}, 2000); 