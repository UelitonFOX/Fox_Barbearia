import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../services/auth';
import Navbar from './Navbar';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const userIsAuthenticated = isAuthenticated();
  const userIsAdmin = isAdmin();

  // Verificar se o usuário está autenticado
  if (!userIsAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verificar se a rota requer permissão de admin
  if (requireAdmin && !userIsAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Renderizar a rota protegida com o layout padrão
  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute; 