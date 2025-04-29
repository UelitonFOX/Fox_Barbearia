import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { FiUserCheck, FiLock } from 'react-icons/fi';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const user = await login({ username, password });
      
      // Redirecionar para o Dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Usuário ou senha incorretos');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            🦊 Fox Barbearia
          </h1>
          <p className="text-gray-400 mt-2">Sistema Interno</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Entrar no Sistema</h2>
          
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-white px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="username">
                Usuário / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiUserCheck className="text-gray-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  className="input pl-10 w-full"
                  placeholder="Digite seu usuário ou email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiLock className="text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="input pl-10 w-full"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="btn w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-6 text-gray-500 text-sm">
          Fox Barbearia &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Login; 