import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../services/auth';
import { FiUserCheck, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { FaGoogle, FaFacebookF, FaTwitter } from 'react-icons/fa';
import Spinner from '../components/Spinner';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Tentando fazer login com:', username);
      const success = await login(username, password);
      
      if (success) {
        console.log('Login bem-sucedido, redirecionando...');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver autenticado, redirecionar para o dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const toggleForm = () => {
    setIsNewUser(!isNewUser);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      {/* Efeitos de brilho e iluminação */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/10 filter blur-3xl top-0 -right-48 animate-pulse"></div>
      <div className="absolute w-96 h-96 rounded-full bg-blue-600/10 filter blur-3xl -bottom-48 -left-48 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute w-96 h-96 rounded-full bg-indigo-600/10 filter blur-3xl -top-48 -left-48 animate-pulse" style={{ animationDelay: '2.5s' }}></div>
      
      {/* Card principal com efeito glass */}
      <div className="relative bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-2xl overflow-hidden w-full max-w-5xl shadow-2xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Lado esquerdo - Área de boas-vindas e logo */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Efeito de luz no canto superior */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full filter blur-xl"></div>
            
            <div className="z-10 mt-8 md:mt-12">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">BEM-VINDO</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mb-6"></div>
              <p className="text-gray-300 text-lg mb-6">Sistema de Gerenciamento</p>
              <p className="text-gray-400 mb-8">Fox Barbearia</p>
              
              <button 
                onClick={toggleForm}
                className="mt-4 py-2.5 px-6 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-all flex items-center gap-2"
              >
                <FiUserCheck className="text-indigo-400" />
                {isNewUser ? 'Fazer Login' : 'Criar Conta'}
              </button>
            </div>
            
            {/* Área da logo */}
            <div className="mt-auto z-10 flex flex-col items-center">
              <div className="w-full flex justify-center items-center mb-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-2xl shadow-lg">
                  <span className="text-6xl">🦊</span>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm text-center mb-4">© 2023 Fox Barbearia</p>
            </div>
            
            {/* Efeito de linha decorativa */}
            <div className="absolute top-1/2 right-0 w-1/2 h-px bg-gradient-to-r from-transparent to-indigo-500/50"></div>
          </div>
          
          {/* Lado direito - Formulário de login */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isNewUser ? 'CRIAR CONTA' : 'FAÇA LOGIN'}
              </h2>
              <p className="text-gray-400">
                {isNewUser ? 'Preencha os dados para se registrar' : 'Entre com suas credenciais para acessar'}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg mb-6">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-gray-400 text-sm mb-2">Usuário</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="text-gray-500" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    className="bg-gray-900/70 text-white pl-11 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-700"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-400 text-sm mb-2">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="bg-gray-900/70 text-white pl-11 pr-12 py-3 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-700"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-indigo-400"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="flex items-center text-sm">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="mr-2 h-4 w-4 bg-gray-800 border-gray-700 rounded text-indigo-500 focus:ring-indigo-500 focus:ring-opacity-25"
                    />
                    <label htmlFor="remember" className="text-gray-400 text-sm">Lembrar</label>
                  </div>
                  <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">Esqueci a senha</a>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 px-4 rounded-lg w-full disabled:opacity-70 transition-all transform hover:shadow-lg flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? <><Spinner size="sm" /> Entrando...</> : 'ENTRAR'}
                </button>
              </div>
            </form>
            
            {/* Divisor */}
            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gray-700"></div>
              <div className="px-4 text-sm text-gray-500">ou continue com</div>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>
            
            {/* Botões de redes sociais */}
            <div className="flex justify-center space-x-4">
              <button className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                <FaGoogle className="text-red-500" />
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                <FaFacebookF className="text-blue-500" />
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                <FaTwitter className="text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 