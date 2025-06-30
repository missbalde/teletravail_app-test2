import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BadgeusePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [backendConnected, setBackendConnected] = useState(false);

  // Mettre à jour l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Vérifier la connexion au backend
  const checkBackendConnection = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setBackendConnected(true);
    } catch (error) {
      console.error('Erreur connexion backend:', error);
      setBackendConnected(false);
      setMessage('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    }
  };

  // Charger les employés
  const loadEmployees = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      // Sécurise pour toujours avoir un tableau
      const data = response.data;
      const employeesArray = Array.isArray(data) ? data : (Array.isArray(data.employees) ? data.employees : []);
      setEmployees(employeesArray);
      setBackendConnected(true);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
      setMessage('Erreur lors du chargement des employés');
      setBackendConnected(false);
    }
  };

  useEffect(() => {
    checkBackendConnection();
    loadEmployees();
  }, []);

  // Enregistrer un pointage
  const handlePointage = async (type) => {
    if (!selectedEmployee) {
      setMessage('Veuillez sélectionner un employé');
      return;
    }

    if (!backendConnected) {
      setMessage('Erreur de connexion au serveur');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/pointages`, {
        employee_id: selectedEmployee,
        type_pointage: type
      });

      setMessage(response.data.message);
      
      // Vider le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur pointage:', error);
      setMessage(error.response?.data?.error || 'Erreur lors du pointage');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light" style={{ width: '100vw', maxWidth: '100vw', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header Badgeuse */}
      <header className="bg-primary text-white py-4 shadow-sm" style={{ width: '100%' }}>
        <div className="container-fluid" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="text-center">
            <h1 className="h2 mb-0 fw-bold">
              Pointer
            </h1>
            <p className="mb-0 mt-2">Pointage des employés</p>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw' }}>
        <div style={{ width: '100%', maxWidth: 600 }}>
          <div className="card shadow-lg border-0" style={{ width: '100%' }}>
              <div className="card-header bg-primary text-white text-center py-4">
                <div className="h3 mb-0">
                  {currentTime.toLocaleTimeString('fr-FR')}
                </div>
                <div className="text-light mt-2">
                  {currentTime.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div className="card-body p-5">
                {/* Statut de connexion */}
                {!backendConnected && (
                  <div className="alert alert-warning mb-4" role="alert">
                    <strong>Attention :</strong> Le serveur backend n'est pas accessible. 
                    Vérifiez qu'il est démarré sur le port 4000.
                  </div>
                )}

                {/* Message de feedback */}
                {message && (
                  <div className={`alert ${message.includes('Erreur') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show mb-4`} role="alert">
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}

                {/* Sélection employé */}
                <div className="mb-5">
                  <label className="form-label fw-bold fs-4 text-center d-block mb-4">
                    Sélectionner votre nom :
                  </label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    style={{ fontSize: '1.2rem' }}
                    disabled={!backendConnected}
                  >
                    <option value="">-- Choisir un employé --</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.nom} {employee.prenom} - {employee.poste}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Boutons de pointage */}
                {selectedEmployee && backendConnected && (
                  <div className="text-center">
                    <h3 className="mb-4">
                      Bonjour <strong>
                        {employees.find(emp => emp.id == selectedEmployee)?.prenom} {' '}
                        {employees.find(emp => emp.id == selectedEmployee)?.nom}
                      </strong>
                    </h3>
                    
                    <div className="row justify-content-center g-4">
                      <div className="col-md-6">
                        <button
                          className="btn btn-success btn-lg w-100 py-4"
                          onClick={() => handlePointage('arrivee')}
                          disabled={loading}
                          style={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          ) : (
                            <span className="me-2">→</span>
                          )}
                        POINTAGE ARRIVÉE
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button
                          className="btn btn-danger btn-lg w-100 py-4"
                          onClick={() => handlePointage('depart')}
                          disabled={loading}
                          style={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          ) : (
                            <span className="me-2">←</span>
                          )}
                        POINTAGE DÉPART
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => setSelectedEmployee('')}
                      >
                        Changer d'employé
                      </button>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {!selectedEmployee && backendConnected && (
                  <div className="text-center text-muted mt-5">
                    <h4>Sélectionnez votre nom dans la liste ci-dessus</h4>
                    <p className="fs-5">Puis cliquez sur "Arrivée" ou "Départ"</p>
                  </div>
                )}

                {/* Message si pas de connexion */}
                {!backendConnected && (
                  <div className="text-center text-muted mt-5">
                    <h4>Serveur non accessible</h4>
                    <p className="fs-5">Veuillez démarrer le serveur backend</p>
                    <button 
                      className="btn btn-primary"
                      onClick={checkBackendConnection}
                    >
                      Réessayer la connexion
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 