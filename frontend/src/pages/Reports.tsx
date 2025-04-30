import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiCalendar, FiPieChart, FiBarChart2, FiUsers, 
  FiDollarSign, FiTarget, FiRefreshCw
} from 'react-icons/fi';
import { getCurrentUser, isAdmin } from '../services/auth';
import api from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// Importações para gráficos
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Registrar componentes do ChartJS
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

// Configurar locale para português
dayjs.locale('pt-br');

// Interfaces
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
  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [periodType, setPeriodType] = useState<string>('day');
  const [startDate, setStartDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  // Carregar usuários (para admin)
  useEffect(() => {
    if (userIsAdmin) {
      loadUsers();
    }
  }, [userIsAdmin]);

  // Função para carregar lista de barbeiros
  const loadUsers = async () => {
    try {
      const response = await api.get('/users/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
      toast.error('Não foi possível carregar a lista de barbeiros.');
    }
  };

  // Função para gerar relatório com tratamento de erro melhorado
  const generateReport = async () => {
    setIsLoading(true);
    setError('');
    setReportData(null);

    try {
      // Construir parâmetros
      const params: Record<string, string> = {
        period_type: periodType,
        start_date: startDate,
      };

      // Adicionar parâmetros opcionais se preenchidos
      if (endDate) {
        params.end_date = endDate;
      }

      if (selectedUserId && userIsAdmin) {
        params.user_id = selectedUserId;
      }

      // Log para debugging
      console.log('Gerando relatório com parâmetros:', params);
      
      // Aumentar o timeout para conexões lentas
      const response = await api.get('/reports/period', { 
        params,
        timeout: 20000
      });
      
      console.log('Dados do relatório recebidos:', response.data);
      
      // Verificar se os dados estão no formato esperado
      if (!response.data || !response.data.summary) {
        console.error('Formato de dados inválido:', response.data);
        setError('Dados do relatório em formato inválido.');
        return;
      }
      
      setReportData(response.data);
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        // O servidor respondeu com status não 2xx
        const status = error.response.status;
        if (status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
        } else if (status === 403) {
          setError('Você não tem permissão para visualizar estes relatórios.');
        } else if (status === 404) {
          setError('Endpoint de relatórios não encontrado.');
        } else if (error.response?.data?.detail) {
          setError(`Erro: ${error.response.data.detail}`);
        } else {
          setError(`Erro no servidor (${status}): Não foi possível gerar o relatório.`);
        }
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta (problema de rede)
        setError('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
      } else {
        // Algo aconteceu na configuração da requisição que acionou o erro
        setError('Erro ao processar a requisição: ' + (error.message || 'Erro desconhecido'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para mudança de tipo de período
  const handlePeriodTypeChange = (type: string) => {
    setPeriodType(type);
    
    // Reset da data final para cada tipo de período
    if (type === 'day') {
      setEndDate(''); // Para dia, mostramos apenas um dia
    } else if (type === 'week') {
      // Para semana, mostramos 7 dias a partir da data inicial
      setEndDate(dayjs(startDate).add(6, 'day').format('YYYY-MM-DD'));
    } else if (type === 'month') {
      // Para mês, mostramos o mês inteiro
      setEndDate(dayjs(startDate).endOf('month').format('YYYY-MM-DD'));
    }
  };

  // Preparar dados para gráfico de evolução diária
  const prepareDailyChartData = () => {
    if (!reportData) return null;

    const labels = reportData.daily_data.map(day => dayjs(day.date).format('DD/MM'));
    const values = reportData.daily_data.map(day => day.total);
    const counts = reportData.daily_data.map(day => day.count);

    return {
      labels,
      datasets: [
        {
          label: 'Faturamento (R$)',
          data: values,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Quantidade',
          data: counts,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y1',
        },
      ],
    };
  };

  // Preparar dados para gráfico de formas de pagamento
  const preparePaymentChartData = () => {
    if (!reportData) return null;

    const labels = Object.keys(reportData.payment_summary).map(method => {
      // Traduzir os métodos de pagamento
      if (method === 'cash') return 'Dinheiro';
      if (method === 'credit_card') return 'Cartão de Crédito';
      if (method === 'debit_card') return 'Cartão de Débito';
      if (method === 'pix') return 'PIX';
      return method;
    });
    
    const values = Object.values(reportData.payment_summary);

    return {
      labels,
      datasets: [
        {
          label: 'Valor por forma de pagamento',
          data: values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
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
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        },
        {
          label: 'Quantidade',
          data: counts,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
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
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Quantidade',
        },
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-200">
      <h1 className="text-3xl font-bold mb-8 text-white text-center">Relatórios</h1>

      {/* Filtros */}
      <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-5 text-orange-500 flex items-center">
          <FiTarget className="mr-2" /> Filtros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tipo de Período */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de Período</label>
            <div className="flex space-x-2">
              {['day', 'week', 'month'].map((type) => (
                 <button
                   key={type}
                   type="button"
                   onClick={() => handlePeriodTypeChange(type)}
                   className={`flex-1 px-3 py-2 text-sm rounded-md transition duration-200 ${
                     periodType === type
                       ? 'bg-orange-600 text-white font-semibold'
                       : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                   }`}
                 >
                   {type === 'day' ? 'Dia' : type === 'week' ? 'Semana' : 'Mês'}
                 </button>
              ))}
            </div>
          </div>

          {/* Data Inicial */}
          <div className="mb-4">
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-400 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Data Final (opcional) */}
          {periodType !== 'day' && (
            <div className="mb-4">
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-400 mb-1">
                Data Final
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Barbeiro (apenas para admin) */}
          {userIsAdmin && (
            <div className="mb-4">
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-400 mb-1">
                Barbeiro
              </label>
              <select
                id="user_id"
                name="user_id"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                // Adicionar estilo para seta do select em tema escuro pode ser complexo, usar padrão
              >
                <option value="" className="bg-gray-800">Todos os barbeiros</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="bg-gray-800">
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Botão Gerar Relatório */}
        <div className="mt-5">
          <button
            type="button"
            onClick={generateReport}
            disabled={isLoading}
            className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-md flex items-center hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Resultados do relatório */}
      {reportData && (
        <div className="mt-8">
          {/* Título pode ser removido ou estilizado se necessário */}
          {/* <h2 className="text-xl font-semibold mb-4 text-white flex items-center"> ... </h2> */}

          {/* Cards com resumo - Tema escuro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[ // Mapear para reduzir repetição
              { icon: FiUsers, title: "Total de Atendimentos", value: reportData.summary.total_attendances, color: "blue-500", format: (v: number) => v },
              { icon: FiDollarSign, title: "Faturamento Bruto", value: reportData.summary.total_original, color: "green-500", format: formatCurrency },
              { icon: FiDollarSign, title: "Total de Descontos", value: reportData.summary.total_discount, color: "red-500", format: formatCurrency },
              { icon: FiDollarSign, title: "Faturamento Líquido", value: reportData.summary.total_final, color: "purple-500", format: formatCurrency },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={`bg-gray-800 shadow-lg rounded-lg p-5 border-l-4 border-${item.color}`}>
                  <div className={`flex items-center mb-2 text-${item.color}`}>
                    <Icon className="mr-2" size={20}/>
                    <h3 className="font-medium text-sm text-gray-400 uppercase tracking-wider">{item.title}</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{item.format(item.value)}</p>
                </div>
              );
            })}
          </div>

          {/* Gráficos - Tema escuro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de evolução diária */}
            <div className="bg-gray-800 shadow-lg rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg text-white">Evolução no Período</h3>
              <div className="h-72">
                {prepareDailyChartData() ? (
                  <Line data={prepareDailyChartData()!} options={lineChartOptions} />
                ) : <p className="text-gray-500 text-center pt-10">Sem dados para exibir.</p>}
              </div>
            </div>

            {/* Gráfico de distribuição por forma de pagamento */}
            <div className="bg-gray-800 shadow-lg rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg text-white">Formas de Pagamento</h3>
              <div className="h-72 flex items-center justify-center">
                {preparePaymentChartData() ? (
                  <Pie data={preparePaymentChartData()!} />
                ) : <p className="text-gray-500 text-center pt-10">Sem dados para exibir.</p>}
              </div>
            </div>
          </div>

          {/* Gráfico de top serviços */}
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4 text-lg text-white">Top 5 Serviços</h3>
            <div className="h-80">
              {prepareServicesChartData() ? (
                <Bar data={prepareServicesChartData()!} options={{ indexAxis: 'y' as const, responsive: true }} />
              ) : <p className="text-gray-500 text-center pt-10">Sem dados para exibir.</p>}
            </div>
          </div>
        </div>
      )}
      {/* Adicionar mensagem inicial ou de loading */}
      {!reportData && !isLoading && !error && (
        <div className="text-center text-gray-500 mt-10">
          <FiPieChart size={40} className="mx-auto mb-4"/>
          Selecione os filtros e clique em "Gerar Relatório" para visualizar os dados.
        </div>
      )}
    </div>
  );
};

export default Reports; 