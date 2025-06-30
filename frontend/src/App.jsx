import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';
import SalarieDashboard from './SalarieDashboard';
import BadgeusePage from './BadgeusePage';
import { ErrorBoundary } from './ErrorBoundary';
import PrivateRoute from './PrivateRoute';
import QrPointage from './QrPointage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </div>;
  }

  return (
    <ErrorBoundary>
    <Routes>
      {/* Page login accessible uniquement si pas connecté */}
        {!user && <Route path="/" element={<Login />} />}

      {/* Route publique pour la badgeuse */}
      <Route path="/badgeuse" element={<BadgeusePage />} />

        {/* Route publique pour le pointage QR code */}
        <Route path="/pointage/qr/:employee_id" element={<QrPointage />} />

      {/* Routes protégées */}
      <Route 
        path="/dashboard" 
        element={
            <PrivateRoute requiredRole="admin">
            <Dashboard />
          </PrivateRoute>
        } 
      />

        <Route 
          path="/salarie" 
          element={
            <PrivateRoute requiredRole="salarie">
              <SalarieDashboard />
            </PrivateRoute>
          } 
        />

        {/* Si utilisateur connecté, rediriger selon le rôle */}
        {user && (
          <>
            {user.role === 'admin' && <Route path="*" element={<Navigate to="/dashboard" replace />} />}
            {user.role === 'salarie' && <Route path="*" element={<Navigate to="/salarie" replace />} />}
          </>
        )}

      {/* Si utilisateur non connecté, toute autre route va à la login */}
        {!user && <Route path="*" element={<Navigate to="/" replace />} />}
    </Routes>
    </ErrorBoundary>
  );
}


