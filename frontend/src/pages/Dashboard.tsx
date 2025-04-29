import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiScissors, FiDollarSign, FiBarChart2, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import { getCurrentUser } from '../services/auth';

interface DailySummary {
  date: string;
  total_attendances: number;
  total_original: number;
  total_discount: number;
  total_final: number;
  payment_summary: {
    pix?: number;
    card?: number;
    cash?: number;
  };
}

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        setLoading(true);
        const response = await api.get('/attendances/summary/daily');
        setSummary(response.data);
      } catch (err) {
        console.error('Erro ao carregar resumo diário:', err);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailySummary();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary text-lg">Carregando dados...</div>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Olá, {currentUser?.name}</h1>
          <p className="text-gray-400">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Link to="/atendimentos/novo" className="btn flex items-center">
          <FiPlus className="mr-1" /> Novo Atendimento
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-primary/20 p-3 mr-3">
            <FiScissors className="text-primary text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Atendimentos</p>
            <h3 className="text-2xl font-bold">{summary?.total_attendances || 0}</h3>
          </div>
        </div>
        
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-green-800/20 p-3 mr-3">
            <FiDollarSign className="text-green-500 text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Faturamento</p>
            <h3 className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(summary?.total_final || 0)}
            </h3>
          </div>
        </div>
        
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-secondary/20 p-3 mr-3">
            <FiCalendar className="text-secondary text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Agendamentos</p>
            <h3 className="text-2xl font-bold">0</h3>
          </div>
        </div>
        
        <div className="card p-4 flex items-center">
          <div className="rounded-full bg-red-800/20 p-3 mr-3">
            <FiBarChart2 className="text-red-500 text-xl" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Descontos</p>
            <h3 className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(summary?.total_discount || 0)}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Resumo do Dia</h3>
          
          <div className="bg-gray-700/30 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Bruto</p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(summary?.total_original || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Descontos</p>
                <p className="text-lg font-semibold text-red-500">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(summary?.total_discount || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Líquido</p>
                <p className="text-lg font-semibold text-green-500">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(summary?.total_final || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <h4 className="text-md font-semibold mb-3">Formas de Pagamento</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span>PIX</span>
              </div>
              <span>
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(summary?.payment_summary.pix || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span>Cartão</span>
              </div>
              <span>
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(summary?.payment_summary.card || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Dinheiro</span>
              </div>
              <span>
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(summary?.payment_summary.cash || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Próximos Agendamentos</h3>
          
          <div className="text-center py-6">
            <FiCalendar className="mx-auto text-3xl text-gray-500 mb-2" />
            <p className="text-gray-400">Nenhum agendamento para hoje</p>
            <Link to="/agenda" className="btn-secondary mt-4 block mx-auto w-full max-w-xs">
              Ver Agenda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 