import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiClock, FiUser, FiDollarSign, FiList } from 'react-icons/fi';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { getCurrentUser } from '../services/auth';

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
    full_name: string;
  };
  service: {
    id: number;
    name: string;
  };
}

const TodayAttendances = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const currentUser = getCurrentUser();

  // Carregar atendimentos do dia atual ao montar o componente
  useEffect(() => {
    loadTodayAttendances();
  }, []);

  const loadTodayAttendances = async () => {
    try {
      setLoading(true);
      
      // Obter data de hoje no formato ISO
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar atendimentos apenas do dia atual
      const response = await api.get(`/attendances/?start_date=${today}&end_date=${today}`);
      
      setAttendances(response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar atendimentos do dia:', err);
      setError('Não foi possível carregar os atendimentos do dia.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadTodayAttendances();
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary text-lg">Carregando atendimentos...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Atendimentos de Hoje</h1>
        <div className="flex space-x-2">
          <Link to="/atendimentos" className="btn-secondary flex items-center">
            <FiList className="mr-1" /> Ver Histórico
          </Link>
          <button 
            onClick={handleRefresh} 
            className="btn-secondary flex items-center"
            disabled={refreshing}
          >
            <FiRefreshCw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <Link to="/atendimentos/novo" className="btn flex items-center">
            <FiPlus className="mr-1" /> Novo Atendimento
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 p-4 rounded-md mb-6">
          <p className="text-white">{error}</p>
        </div>
      )}

      {/* Total diário */}
      {attendances.length > 0 && (
        <div className="card p-4 mb-6 bg-primary/20">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Total de hoje</h3>
              <p className="text-sm text-gray-400">
                {attendances.length} {attendances.length === 1 ? 'atendimento' : 'atendimentos'}
              </p>
            </div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(attendances.reduce((sum, att) => sum + att.final_value, 0))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de atendimentos */}
      {attendances.length === 0 ? (
        <div className="text-center py-8 card">
          <p className="text-gray-400 mb-2">Nenhum atendimento registrado hoje</p>
          <p className="text-gray-500 text-sm">
            Registre um novo atendimento usando o botão acima.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {attendances.map(attendance => (
            <div key={attendance.id} className="card p-4 hover:bg-gray-800/50 transition">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-2 md:mb-0">
                  <p className="font-semibold flex items-center">
                    <FiUser className="mr-1 text-primary" /> 
                    {attendance.user.full_name}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center">
                    <FiClock className="mr-1" /> 
                    {formatTime(attendance.date_time)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">
                      {attendance.service.name}
                    </span>
                    <span className="bg-primary/20 text-primary rounded px-2 py-0.5 text-xs">
                      {formatPaymentMethod(attendance.payment_method)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-1">
                    {attendance.discount_amount > 0 && (
                      <div className="flex flex-col items-end mr-3">
                        <span className="text-xs text-gray-500">Original</span>
                        <span className="text-sm line-through text-gray-500">
                          {formatCurrency(attendance.original_value)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">Final</span>
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

export default TodayAttendances; 