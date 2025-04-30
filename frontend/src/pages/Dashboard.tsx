import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiScissors, FiDollarSign, FiBarChart2, FiPlus, FiClock } from 'react-icons/fi';
import api from '../services/api';
import { getCurrentUser, isAdmin } from '../services/auth';
import dayjs from 'dayjs';
import Spinner from '../components/Spinner';

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

// Interface para agendamentos do dia
interface TodayAppointment {
  id: number;
  client_name: string;
  date_time: string;
  user: { full_name: string };
  service: { name: string };
}

// Interface para resumo por barbeiro
interface BarberSummaryItem {
  user_id: number;
  user_name: string;
  total_attendances: number;
  total_final_value: number;
}

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [barberSummary, setBarberSummary] = useState<BarberSummaryItem[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingBarberSummary, setLoadingBarberSummary] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin(); // Precisamos disso para buscar o resumo por barbeiro
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch Summary
      setLoadingSummary(true);
      try {
        const summaryResponse = await api.get('/dashboard/summary');
        setSummary(summaryResponse.data);
      } catch (err) {
        console.error('Erro ao carregar resumo diário:', err);
        setError(prev => prev ? prev + ' | Resumo diário' : 'Resumo diário');
      } finally {
        setLoadingSummary(false);
      }

      // Fetch Today's Appointments
      setLoadingAppointments(true);
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const appointmentsResponse = await api.get('/appointments', {
          params: { start_date: today, end_date: today }
        });
        setTodayAppointments(appointmentsResponse.data || []);
      } catch (err) {
        console.error('Erro ao carregar agendamentos do dia:', err);
        setError(prev => prev ? prev + ' | Agendamentos do dia' : 'Agendamentos do dia');
      } finally {
        setLoadingAppointments(false);
      }

      // Fetch Barber Summary (apenas admin)
      if (userIsAdmin) {
        setLoadingBarberSummary(true);
        try {
          const barberSummaryResponse = await api.get('/dashboard/barber-summary');
          setBarberSummary(barberSummaryResponse.data || []);
        } catch (err) {
          console.error('Erro ao carregar resumo por barbeiro:', err);
          setError(prev => prev ? prev + ' | Resumo Barbeiros' : 'Resumo Barbeiros');
        } finally {
          setLoadingBarberSummary(false);
        }
      }
    };
    
    fetchDashboardData();
  }, [userIsAdmin]);
  
  // Estado de loading combinado
  const isLoading = loadingSummary || loadingAppointments || (userIsAdmin && loadingBarberSummary);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner message="Carregando dados do dashboard..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 p-4 rounded-md">
        <p className="text-white">Erro ao carregar: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Olá, {currentUser?.username || currentUser?.name}</h1>
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
          <h3 className="text-lg font-semibold mb-4">Próximos Agendamentos (Hoje)</h3>
          
          {loadingAppointments ? (
            <Spinner size="sm" />
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-6">
              <FiCalendar className="mx-auto text-3xl text-gray-500 mb-2" />
              <p className="text-gray-400">Nenhum agendamento para hoje.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
              {todayAppointments.map(app => (
                <div key={app.id} className="bg-gray-700/50 p-2 rounded-md">
                  <p className="text-sm font-semibold text-white truncate" title={app.client_name}>{app.client_name}</p>
                  <p className="text-xs text-gray-300 truncate">{app.service.name} com {app.user.full_name}</p>
                  <p className="text-xs text-primary font-medium flex items-center">
                    <FiClock className="mr-1" />
                    {dayjs(app.date_time).format('HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          <Link to="/agenda" className="btn-secondary mt-4 block text-center w-full">
            Ver Agenda Completa
          </Link>
        </div>
      </div>

      {/* Novo Card: Resumo por Barbeiro (Admin) */} 
      {userIsAdmin && (
        <div className="card p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Resumo por Barbeiro (Hoje)</h3>
          {loadingBarberSummary ? (
            <Spinner size="sm" message="Carregando resumo..." />
          ) : barberSummary.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum atendimento registrado hoje para calcular o resumo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2">Barbeiro</th>
                    <th className="p-2 text-center">Atendimentos</th>
                    <th className="p-2 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {barberSummary.map(item => (
                    <tr key={item.user_id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-2">{item.user_name}</td>
                      <td className="p-2 text-center">{item.total_attendances}</td>
                      <td className="p-2 text-right font-medium text-green-500">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(item.total_final_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 