import { useState } from 'react';
import { useAuth } from './AuthContext';
import EmployeeForm from './EmployeeForm';
import EmployeeList from './EmployeeList';
import Planning from './Planning';
import PointageView from './PointageView';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [employeesRefresh, setEmployeesRefresh] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');

  const handleEmployeeAdded = () => {
    console.log('Employé ajouté/modifié, rafraîchissement...');
    setEmployeesRefresh(prev => !prev);
    // Délai pour éviter l'erreur DOM lors du démontage
    setTimeout(() => {
      setSelectedEmployee(null);
    }, 100);
  };

  const handleEdit = (employee) => {
    console.log('Édition employé:', employee);
    setSelectedEmployee(employee);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="alert alert-danger">
          <h4>Accès non autorisé</h4>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const renderEmployeesTab = () => (
    <div className="row g-4">
      <div className="col-lg-5">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <EmployeeForm
              key={selectedEmployee ? selectedEmployee.id : 'new'}
              onEmployeeAdded={handleEmployeeAdded}
              selectedEmployee={selectedEmployee}
            />
          </div>
        </div>
      </div>

      <div className="col-lg-7">
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <EmployeeList 
              key={`employees-${employeesRefresh}`}
              onEdit={handleEdit} 
              refresh={employeesRefresh} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPointageTab = () => (
    <PointageView key="pointage-view" />
  );

  const renderPlanningTab = () => (
    <Planning key="planning-view" />
  );

  return (
    <div className="min-vh-100 bg-light" style={{ width: '100vw', margin: 0, padding: 0 }}>
      <header className="bg-primary text-white py-4 shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0 fw-bold">Espace Administrateur</h1>
            <div className="d-flex gap-2">
              <small className="text-light me-3">Connecté en tant que {user.nom}</small>
              <a 
                href="/badgeuse" 
                className="btn btn-outline-light fw-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-clock me-2"></i>
                Badgeuse
              </a>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light fw-semibold"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4" style={{ width: '100%' }}>
        {/* Navigation par onglets */}
        <ul className="nav nav-tabs mb-4" id="dashboardTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
              type="button"
              role="tab"
            >
              <i className="fas fa-users me-2"></i>
              Gestion Employés
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'pointage' ? 'active' : ''}`}
              onClick={() => setActiveTab('pointage')}
              type="button"
              role="tab"
            >
              <i className="fas fa-clock me-2"></i>
              Suivi Pointages
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'planning' ? 'active' : ''}`}
              onClick={() => setActiveTab('planning')}
              type="button"
              role="tab"
            >
              <i className="fas fa-calendar me-2"></i>
              Planning
            </button>
          </li>
        </ul>

        {/* Contenu des onglets */}
        <div className="tab-content" id="dashboardTabContent">
          
          <div className={`tab-pane fade ${activeTab === 'employees' ? 'show active' : ''}`} role="tabpanel">
            {activeTab === 'employees' && renderEmployeesTab()}
          </div>

          <div className={`tab-pane fade ${activeTab === 'pointage' ? 'show active' : ''}`} role="tabpanel">
            {activeTab === 'pointage' && renderPointageTab()}
          </div>

          <div className={`tab-pane fade ${activeTab === 'planning' ? 'show active' : ''}`} role="tabpanel">
            {activeTab === 'planning' && renderPlanningTab()}
          </div>

        </div>
      </main>
    </div>
  );
}
