import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:4000/api';

export default function EmployeeList({ onEdit, refresh }) {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEmployees = () => {
    setLoading(true);
    setError(null);
    
    fetch(`${API_BASE_URL}/employees`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des salariés');
        return res.json();
      })
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    try {
      loadEmployees();
    } catch (err) {
      setError('Erreur inattendue: ' + err.message);
      setLoading(false);
    }
  }, [refresh]);

  const handleDelete = (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce salarié ?')) return;

    fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de la suppression');
        return res.json();
      })
      .then(() => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
      })
      .catch(err => setError(err.message));
  };

  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        <strong>Erreur :</strong> {error}
        <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadEmployees}>
          Réessayer
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">Liste des salariés</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover align-middle">
          <thead className="table-primary">
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Poste</th>
              <th>Téléphone</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  Aucun salarié enregistré.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={`employee-${emp.id}`}>
                  <td>{emp.nom || ''}</td>
                  <td>{emp.prenom || ''}</td>
                  <td>
                    <a href={`mailto:${emp.email}`} className="text-decoration-underline text-primary">
                      {emp.email || ''}
                    </a>
                  </td>
                  <td>{emp.poste || ''}</td>
                  <td>{emp.telephone || ''}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => onEdit(emp)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(emp.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
