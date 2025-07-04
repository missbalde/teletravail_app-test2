import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erreur de connexion');
        return;
      }

      login(data.token, data.user);
      
      // Rediriger selon le rôle
      if (data.user.role === 'admin') {
      navigate('/dashboard');
      } else {
        navigate('/salarie');
      }
    } catch (err) {
      setError('Erreur réseau ou serveur');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}
    >
      <div className="card shadow p-4" style={{ minWidth: '350px', maxWidth: '400px', width: '100%' }}>
        <h2 className="mb-4 text-center text-primary">Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">Mot de passe</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
