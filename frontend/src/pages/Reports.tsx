import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import {
  FiBarChart2,
  FiTarget,
  FiUsers,
  FiPieChart,
  FiRefreshCw,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiActivity,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiChevronDown
} from 'react-icons/fi';
import api from '../services/api';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  id: number;
  full_name: string;
  user_type: string;
}

interface ReportSummary {
  total_attendances: number;
  total_original: number;
  total_discount: number;
  total_final: number;
}

interface DailyData {
  date: string;
  count: number;
  total: number;
}

interface WeeklyData {
  week: number;
  count: number;
  total: number;
}

interface TopService {
  id: number;
  name: string;
  count: number;
  total: number;
}

interface ReportData {
  period_type: string;
  start_date: string;
  end_date: string;
  summary: ReportSummary;
  payment_summary: Record<string, number>;
  daily_data: DailyData[];
  weekly_data?: WeeklyData[];
  top_services: TopService[];
}

const Reports = () => {
  const navigate = useNavigate();
  const [periodType, setPeriodType] = useState<string>('day');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    setUserIsAdmin(userType === 'admin');

    // Se for admin, carregar lista de barbeiros
    if (userType === 'admin') {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoint = `/reports/${periodType}`;
      let params: Record<string, string> = { start_date: startDate };
      
      if (periodType !== 'day') {
        params.end_date = endDate;
      }
      
      if (selectedUserId) {
        params.user_id = selectedUserId;
      }
      
      const response = await api.get(endpoint, { params });
      
      setReportData(response.data);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (error.response?.status === 403) {
          toast.error('Você não tem permissão para acessar este recurso.');
        } else if (error.response?.data?.detail) {
          setError(error.response.data.detail);
        } else {
          setError('Erro ao gerar relatório. Tente novamente mais tarde.');
        }
      } else {
        setError('Erro ao gerar relatório. Verifique sua conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manipulador de mudança de tipo de período
  const handlePeriodTypeChange = (type: string) => {
    setPeriodType(type);
    
    // Se mudar para "day", ajustar data final para igual à inicial
    if (type === 'day') {
      setEndDate(startDate);
    } else {
      // Para semana ou mês, definir data final como 7 ou 30 dias depois
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() + (type === 'week' ? 7 : 30));
      setEndDate(newEndDate.toISOString().split('T')[0]);
    }
  };

  // Preparar dados para gráfico de linha (evolução diária)
  const prepareDailyChartData = () => {
    if (!reportData) return null;

    const labels = reportData.daily_data.map(item => {
      // Formatar data para DD/MM
      const date = new Date(item.date);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    });
    const values = reportData.daily_data.map(item => item.total);
    const counts = reportData.daily_data.map(item => item.count);

    return {
      labels,
      datasets: [
        {
          label: 'Valor Total (R$)',
          data: values,
          borderColor: 'rgb(255, 117, 24)',
          backgroundColor: 'rgba(255, 117, 24, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Quantidade de Atendimentos',
          data: counts,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };

  // Preparar dados para gráfico de pizza (formas de pagamento)
  const preparePaymentChartData = () => {
    if (!reportData) return null;

    const labels = Object.keys(reportData.payment_summary).map(key => {
      // Mapear chaves para nomes amigáveis
      switch(key) {
        case 'cash': return 'Dinheiro';
        case 'credit_card': return 'Cartão de Crédito';
        case 'debit_card': return 'Cartão de Débito';
        case 'pix': return 'PIX';
        default: return key;
      }
    });
    const values = Object.values(reportData.payment_summary);

    return {
      labels,
      datasets: [
        {
          label: 'Valor por forma de pagamento',
          data: values,
          backgroundColor: [
            'rgba(255, 117, 24, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderColor: [
            'rgba(255, 117, 24, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Preparar dados para gráfico de top serviços
  const prepareServicesChartData = () => {
    if (!reportData) return null;

    const labels = reportData.top_services.map(service => service.name);
    const values = reportData.top_services.map(service => service.total);
    const counts = reportData.top_services.map(service => service.count);

    return {
      labels,
      datasets: [
        {
          label: 'Valor Total (R$)',
          data: values,
          backgroundColor: 'rgba(255, 117, 24, 0.7)',
          borderColor: 'rgba(255, 117, 24, 1)',
          borderWidth: 1,
        },
        {
          label: 'Quantidade',
          data: counts,
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Formatar valor como moeda (R$)
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Opções para gráfico de linha (evolução diária)
  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Valor (R$)',
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        title: {
          display: true,
          text: 'Quantidade',
          color: 'rgba(255, 255, 255, 0.7)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.9)'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: 'rgba(255, 117, 24, 1)'
      }
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: 'rgba(255, 117, 24, 1)'
      }
    },
    scales: reportData?.top_services ? {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    } : undefined
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FiBarChart2 className="mr-3 text-orange-500" size={28} /> Relatórios
          </h1>
          
          {reportData && (
            <div className="text-sm text-gray-400 flex items-center">
              <FiCalendar className="mr-1" />
              <span>
                {new Date(reportData.start_date).toLocaleDateString('pt-BR')}
                {periodType !== 'day' && ` - ${new Date(reportData.end_date).toLocaleDateString('pt-BR')}`}
              </span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 shadow-xl rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-5 text-orange-500 flex items-center">
            <FiTarget className="mr-2" /> Filtros do Relatório
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tipo de Período */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                <FiClock className="mr-1" /> Tipo de Período
              </label>
              <div className="flex space-x-2">
                {[
                  { type: 'day', label: 'Dia', icon: FiCalendar },
                  { type: 'week', label: 'Semana', icon: FiActivity },
                  { type: 'month', label: 'Mês', icon: FiTrendingUp }
                ].map(({type, label, icon: Icon}) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePeriodTypeChange(type)}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition duration-200 flex items-center justify-center ${
                      periodType === type
                        ? 'bg-orange-600 text-white font-semibold'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="mr-1" size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Inicial */}
            <div className="mb-4">
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-400 mb-1 flex items-center">
                <FiCalendar className="mr-1" /> Data Inicial
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
              />
            </div>

            {/* Data Final (opcional) */}
            {periodType !== 'day' && (
              <div className="mb-4">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-400 mb-1 flex items-center">
                  <FiCalendar className="mr-1" /> Data Final
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                />
              </div>
            )}

            {/* Barbeiro (apenas para admin) */}
            {userIsAdmin && (
              <div className="mb-4">
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-400 mb-1 flex items-center">
                  <FiUsers className="mr-1" /> Barbeiro
                </label>
                <div className="relative">
                  <select
                    id="user_id"
                    name="user_id"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none transition duration-200"
                  >
                    <option value="" className="bg-gray-800">Todos os barbeiros</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id} className="bg-gray-800">
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <FiChevronDown size={16} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão Gerar Relatório */}
          <div className="mt-5">
            <button
              type="button"
              onClick={generateReport}
              disabled={isLoading}
              className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-md flex items-center hover:bg-orange-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <FiBarChart2 className="mr-2" /> Gerar Relatório
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mensagem de erro - Estilo escuro */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative mb-6 shadow-lg animate-fade-in" role="alert">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Resultados do relatório */}
        {reportData && (
          <div className="mt-8 animate-fade-in">
            {/* Cards com resumo - Tema escuro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[ // Mapear para reduzir repetição
                { 
                  icon: FiUsers, 
                  title: "Total de Atendimentos", 
                  value: reportData.summary.total_attendances, 
                  color: "blue-500", 
                  format: (v: number) => v,
                  desc: "atendimentos realizados" 
                },
                { 
                  icon: FiDollarSign, 
                  title: "Faturamento Bruto", 
                  value: reportData.summary.total_original, 
                  color: "green-500", 
                  format: formatCurrency,
                  desc: "valor total bruto" 
                },
                { 
                  icon: FiDollarSign, 
                  title: "Total de Descontos", 
                  value: reportData.summary.total_discount, 
                  color: "red-500", 
                  format: formatCurrency,
                  desc: "em descontos aplicados" 
                },
                { 
                  icon: FiDollarSign, 
                  title: "Faturamento Líquido", 
                  value: reportData.summary.total_final, 
                  color: "orange-500", 
                  format: formatCurrency,
                  desc: "valor final recebido" 
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className={`bg-gray-800 shadow-xl rounded-xl p-5 border-l-4 border-${item.color} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
                    <div className={`flex items-center mb-2 text-${item.color}`}>
                      <div className={`p-2 rounded-full bg-${item.color} bg-opacity-20 mr-3`}>
                        <Icon size={20} />
                      </div>
                      <h3 className="font-medium text-sm text-gray-400 uppercase tracking-wider">{item.title}</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{item.format(item.value)}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Gráficos - Tema escuro */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico de evolução diária */}
              <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300">
                <h3 className="font-semibold mb-4 text-lg text-white flex items-center">
                  <FiTrendingUp className="mr-2 text-blue-400" /> Evolução no Período
                </h3>
                <div className="h-80">
                  {prepareDailyChartData() ? (
                    <Line data={prepareDailyChartData()!} options={lineChartOptions} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FiActivity className="text-gray-600 mb-2" size={30} />
                      <p className="text-gray-500 text-center">Sem dados para exibir.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gráfico de distribuição por forma de pagamento */}
              <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300">
                <h3 className="font-semibold mb-4 text-lg text-white flex items-center">
                  <FiDollarSign className="mr-2 text-green-400" /> Formas de Pagamento
                </h3>
                <div className="h-80 flex items-center justify-center">
                  {preparePaymentChartData() ? (
                    <Pie data={preparePaymentChartData()!} options={chartOptions} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FiPieChart className="text-gray-600 mb-2" size={30} />
                      <p className="text-gray-500 text-center">Sem dados para exibir.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico de top serviços */}
            <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700 mb-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="font-semibold mb-4 text-lg text-white flex items-center">
                <FiAward className="mr-2 text-yellow-400" /> Top 5 Serviços
              </h3>
              <div className="h-80">
                {prepareServicesChartData() ? (
                  <Bar 
                    data={prepareServicesChartData()!} 
                    options={{ 
                      ...chartOptions,
                      indexAxis: 'y' as const
                    }} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FiAward className="text-gray-600 mb-2" size={30} />
                    <p className="text-gray-500 text-center">Sem dados para exibir.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Mensagem inicial quando não há dados */}
        {!reportData && !isLoading && !error && (
          <div className="bg-gray-800 shadow-xl rounded-xl p-10 text-center text-gray-400 mt-10 border border-gray-700">
            <FiPieChart size={50} className="mx-auto mb-4 text-orange-500 opacity-70"/>
            <h3 className="text-xl font-semibold mb-2 text-white">Bem-vindo aos Relatórios</h3>
            <p className="mb-6">Selecione os filtros acima e clique em "Gerar Relatório" para visualizar as estatísticas.</p>
            <div className="flex justify-center">
              <button
                onClick={() => handlePeriodTypeChange('day')}
                className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md flex items-center hover:bg-orange-700 transition duration-300 shadow-lg"
              >
                <FiCheckCircle className="mr-2" /> Gerar Relatório de Hoje
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports; 