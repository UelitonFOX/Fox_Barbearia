import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../services/auth';
import Navbar from './Navbar';
import api from '../services/api';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const userIsAuthenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  const [apiHealthy, setApiHealthy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar a saúde da API ao montar o componente
  useEffect(() => {
    checkApiHealth();
  }, []);

  // Função para verificar a saúde da API
  const checkApiHealth = async () => {
    try {
      setIsLoading(true);
      await api.get('/health');
      setApiHealthy(true);
    } catch (error) {
      console.error('Erro ao verificar a saúde da API:', error);
      setApiHealthy(false);
      toast.error(
        'Não foi possível conectar ao servidor. Algumas funcionalidades podem não estar disponíveis.',
        { autoClose: false }
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        {!apiHealthy && (
          <div className="bg-red-900/30 border border-red-800 p-4 rounded-md mb-6">
            <p className="text-white font-semibold">
              ⚠️ Erro de conexão com o servidor
            </p>
            <p className="text-white/70 text-sm mt-1">
              O sistema não conseguiu estabelecer conexão com o servidor. Algumas funcionalidades podem não estar disponíveis.
            </p>
            <div className="mt-3">
              <button
                onClick={checkApiHealth}
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-primary text-lg">Verificando conexão...</div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default ProtectedRoute; 