import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFilter, FiCalendar, FiDollarSign, FiUser, FiClock } from 'react-icons/fi';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { getCurrentUser, isAdmin } from '../services/auth';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

interface Attendance {
  id: number;
  user_id: number;
  service_id: number;
  original_value: number;
  discount_amount: number;
  final_value: number;
  payment_method: 'pix' | 'card' | 'cash';
  date_time: string;
  user: {
    id: number;
    name: string;
  };
  service: {
    id: number;
    name: string;
  };
}

interface UserFilter {
  id: number;
  full_name: string;
}

const Attendances = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [users, setUsers] = useState<UserFilter[]>([]); 
  const [selectedUserId, setSelectedUserId] = useState<string>(''); 
  
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  useEffect(() => {
    loadAttendances();
    if (userIsAdmin) {
      loadUsersForFilter();
    }
  }, []);

  const loadUsersForFilter = async () => {
    try {
      const response = await api.get('/users/users/');
      const activeUsers = response.data.filter((u: any) => u.active !== false);
      setUsers(activeUsers || []);
    } catch (err) {
      console.error('Erro ao carregar usuários para filtro:', err);
      toast.error('Não foi possível carregar a lista de barbeiros para o filtro.');
      setUsers([]);
    }
  };

  const loadAttendances = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (userIsAdmin && selectedUserId) { 
        params.append('user_id', selectedUserId);
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      console.log(`Carregando atendimentos: /attendances/${queryString}`);
      
      const response = await api.get(`/attendances/${queryString}`, { 
        timeout: 15000 
      });
      
      console.log('Resposta da API:', response.data);
      
      setAttendances(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar atendimentos:', err);
      
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (status === 403) {
          setError('Você não tem permissão para acessar estes dados.');
        } else if (status === 404) {
          setError('Recurso não encontrado no servidor.');
        } else {
          setError(`Erro no servidor: ${err.response.data?.detail || 'Falha ao processar requisição'}`);
        }
      } else if (err.request) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está em execução.');
      } else {
        setError('Erro ao carregar dados: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      pix: 'PIX',
      card: 'Cartão',
      cash: 'Dinheiro'
    };
    return methods[method] || method;
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadAttendances();
  };

  const resetFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedUserId(''); 
    loadAttendances(); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-900">
        <Spinner message="Carregando atendimentos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 p-4 rounded-md">
        <p className="text-white">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Atendimentos</h1>
        <div className="flex space-x-2">
          <Link to="/atendimentos/hoje" className="btn-secondary flex items-center">
            <FiCalendar className="mr-1" /> Ver Hoje
          </Link>
          <Link to="/atendimentos/novo" className="btn flex items-center">
            <FiPlus className="mr-1" /> Novo Atendimento
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6 bg-gray-800 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
          <FiFilter className="mr-2" /> Filtros
        </h2>
        
        <form onSubmit={handleFilter} className="space-y-4">
          <div className={`grid grid-cols-1 md:grid-cols-${userIsAdmin ? '3' : '2'} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Data Inicial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="input pl-10 w-full bg-gray-700 text-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Data Final
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="input pl-10 w-full bg-gray-700 text-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {userIsAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Barbeiro
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <select
                    className="input pl-10 w-full bg-gray-700 text-white"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} 
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={resetFilter}
              className="btn-secondary"
            >
              Limpar
            </button>
            <button
              type="submit"
              className="btn"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Lista de atendimentos */}
      {attendances.length === 0 ? (
        <div className="text-center py-10 card bg-gray-800 border border-gray-700">
          <FiDollarSign className="mx-auto text-4xl text-gray-500 mb-3" /> 
          <p className="text-gray-300 mb-2">Nenhum atendimento encontrado</p>
          <p className="text-gray-400 text-sm">
            Ajuste os filtros ou adicione um novo atendimento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {attendances.map(attendance => (
            <div key={attendance.id} className="card p-4 hover:bg-gray-800/50 transition bg-gray-800 border border-gray-700">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="font-semibold flex items-center text-white">
                    <FiUser className="mr-1 text-primary" /> 
                    {attendance.user?.name || 'Usuário não encontrado'}
                  </p>
                  <p className="text-gray-300 text-sm flex items-center">
                    <FiClock className="mr-1" /> 
                    {formatDate(attendance.date_time)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <span className="text-gray-300 mr-2">
                      {attendance.service.name}
                    </span>
                    <span className="bg-primary/20 text-primary rounded px-2 py-0.5 text-xs">
                      {formatPaymentMethod(attendance.payment_method)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-1">
                    {attendance.discount_amount > 0 && (
                      <div className="flex flex-col items-end mr-3">
                        <span className="text-xs text-gray-400">Original</span>
                        <span className="text-sm line-through text-gray-400">
                          {formatCurrency(attendance.original_value)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">Final</span>
                      <span className="text-lg font-semibold text-green-500">
                        {formatCurrency(attendance.final_value)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendances;

 