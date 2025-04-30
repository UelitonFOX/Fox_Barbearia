import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiEdit, FiTrash2, FiCalendar, 
  FiClock, FiUser, FiChevronLeft, FiChevronRight, 
  FiDollarSign, FiMessageSquare, FiPhone, FiScissors,
  FiCheckCircle, FiXCircle, FiInfo, FiFilter
} from 'react-icons/fi';
import { getCurrentUser, isAdmin } from '../services/auth';
import api from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import Spinner from '../components/Spinner';

dayjs.locale('pt-br');

// Interfaces
interface Appointment {
  id: number;
  client_name: string;
  user_id: number;
  service_id: number;
  date_time: string;
  status: string;
  contact?: string;
  notes?: string;
  user: {
    id: number;
    name: string;
  };
  service: {
    id: number;
    name: string;
    price: number;
    duration_minutes: number;
  };
}

interface User {
  id: number;
  full_name: string;
  user_type: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
}

interface AppointmentFormData {
  client_name: string;
  user_id: number;
  service_id: number;
  date_time: string;
  status: string;
  contact?: string;
  notes?: string;
}

const Appointments = () => {
  // Estados
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>({
    client_name: '',
    user_id: 0,
    service_id: 0,
    date_time: dayjs().format('YYYY-MM-DDTHH:mm'),
    status: 'scheduled'
  });

  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  // Carregar agendamentos
  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  // Carregar barbeiros e serviços para o formulário
  useEffect(() => {
    if (showForm) {
      loadUsers();
      loadServices();
    }
  }, [showForm]);

  const loadAppointments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Log para depuração
      console.log(`Carregando agendamentos para a data: ${selectedDate}`);
      
      const response = await api.get('/appointments', {
        params: {
          start_date: selectedDate,
          end_date: selectedDate
        },
        timeout: 15000 // Aumentar timeout para redes lentas
      });
      
      console.log('Dados de agendamentos recebidos:', response.data);
      
      // Garantir que temos um array
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar agendamentos:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        // O servidor respondeu com status não 2xx
        const status = error.response.status;
        if (status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
          toast.error('Sua sessão expirou. Redirecionando para login...', { autoClose: 3000 });
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }, 3000);
        } else if (status === 403) {
          setError('Você não tem permissão para acessar estes dados.');
        } else if (status === 404) {
          setError('Endpoint de agendamentos não encontrado.');
        } else {
          setError('Erro no servidor: ' + (error.response.data?.detail || 'Falha na requisição'));
        }
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        setError('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
      } else {
        // Algo aconteceu na configuração da requisição que acionou o erro
        setError('Erro ao processar a requisição: ' + (error.message || 'Erro desconhecido'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users/users/');
      
      // Filtrar apenas barbeiros se necessário
      const barbers = response.data.filter((user: User) => 
        user.user_type === 'barber' || user.user_type === 'admin'
      );
      
      setUsers(barbers);
      
      // Preencher o usuário atual como padrão se não for admin
      if (!userIsAdmin && currentUser) {
        setFormData(prev => ({
          ...prev,
          user_id: currentUser.id
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
      toast.error('Não foi possível carregar a lista de barbeiros.');
    }
  };

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Não foi possível carregar a lista de serviços.');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentAppointment) {
        // Atualização
        await api.put(
          `/appointments/${currentAppointment.id}`,
          formData
        );
        
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        // Criação
        await api.post(
          '/appointments',
          formData
        );
        
        toast.success('Agendamento criado com sucesso!');
      }
      
      // Resetar form e recarregar dados
      resetForm();
      loadAppointments();
    } catch (error: any) {
      console.error('Erro ao salvar agendamento:', error);
      
      if (error.response?.data?.detail) {
        toast.error(`Erro: ${error.response.data.detail}`);
      } else {
        toast.error('Não foi possível salvar o agendamento. Tente novamente.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }
    
    try {
      await api.delete(`/appointments/${id}`);
      
      toast.success('Agendamento cancelado com sucesso!');
      loadAppointments();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Não foi possível cancelar o agendamento. Tente novamente.');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      client_name: appointment.client_name,
      user_id: appointment.user_id,
      service_id: appointment.service_id,
      date_time: dayjs(appointment.date_time).format('YYYY-MM-DDTHH:mm'),
      status: appointment.status,
      contact: appointment.contact,
      notes: appointment.notes
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setCurrentAppointment(null);
    setFormData({
      client_name: '',
      user_id: userIsAdmin ? 0 : (currentUser?.id || 0),
      service_id: 0,
      date_time: dayjs().format('YYYY-MM-DDTHH:mm'),
      status: 'scheduled'
    });
    setShowForm(false);
  };

  // Função para navegar para o dia anterior
  const goToPreviousDay = () => {
    setSelectedDate(dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'));
  };

  // Função para navegar para o próximo dia
  const goToNextDay = () => {
    setSelectedDate(dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD'));
  };
  
  // Função para pegar a hora do agendamento
  const getAppointmentTime = (dateTime: string) => {
    return dayjs(dateTime).format('HH:mm');
  };

  // Função para mapear status para cores
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'border-blue-500 bg-blue-900/20 text-blue-400';
      case 'concluido':
        return 'border-green-500 bg-green-900/20 text-green-400';
      case 'cancelado':
        return 'border-red-500 bg-red-900/20 text-red-400';
      default:
        return 'border-gray-500 bg-gray-900/20 text-gray-400';
    }
  };

  // Função para obter ícone com base no status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <FiCalendar className="mr-1.5" />;
      case 'concluido':
        return <FiCheckCircle className="mr-1.5" />;
      case 'cancelado':
        return <FiXCircle className="mr-1.5" />;
      default:
        return <FiInfo className="mr-1.5" />;
    }
  };

  // Renderização condicionada ao carregamento
  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  // Renderização em caso de erro
  if (error && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-6 text-white flex items-center">
            <FiCalendar className="mr-3 text-orange-500" /> Agenda
          </h1>
          <div className="bg-red-900/30 border border-red-800 p-6 rounded-xl mb-6 shadow-lg">
            <h2 className="text-xl font-semibold text-red-200 mb-3 flex items-center">
              <FiInfo className="mr-2 text-red-400" /> Erro ao carregar agendamentos
            </h2>
            <p className="text-white mb-4">{error}</p>
            <button
              onClick={loadAppointments}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors flex items-center"
            >
              <FiRefreshCw className="mr-2" /> Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FiCalendar className="mr-3 text-orange-500" size={28} /> Agenda
          </h1>
          
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md flex items-center shadow-lg transition duration-300"
          >
            <FiPlus className="mr-2" /> Novo Agendamento
          </button>
        </div>

        {/* Controle de data com setas para navegação */}
        <div className="bg-gray-800 shadow-xl rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousDay}
              className="p-3 rounded-full hover:bg-gray-700 transition-colors"
              title="Dia anterior"
            >
              <FiChevronLeft size={20} />
            </button>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-3">
                <FiCalendar className="text-orange-500" size={18} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-gray-400 mt-2 text-sm capitalize">
                {dayjs(selectedDate).format('dddd, DD [de] MMMM [de] YYYY')}
              </p>
            </div>
            
            <button
              onClick={goToNextDay}
              className="p-3 rounded-full hover:bg-gray-700 transition-colors"
              title="Próximo dia"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Formulário de agendamento */}
        {showForm && (
          <div className="bg-gray-800 shadow-xl rounded-xl p-6 mb-8 border border-gray-700 animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center pb-4 border-b border-gray-700">
              <FiCalendar className="mr-3 text-orange-500" />
              {currentAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="client_name" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                    Nome do Cliente
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="client_name"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Nome completo do cliente"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                    <FiUser className="mr-1 text-orange-500" /> Barbeiro
                  </label>
                  <div className="relative">
                    <select
                      id="user_id"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleChange}
                      required
                      disabled={!userIsAdmin} // Apenas admin pode trocar barbeiro
                      className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Selecione o barbeiro</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <FiChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="service_id" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                    <FiScissors className="mr-1 text-orange-500" /> Serviço
                  </label>
                  <div className="relative">
                    <select
                      id="service_id"
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Selecione o serviço</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - R$ {service.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <FiChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="date_time" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                    <FiClock className="mr-1 text-orange-500" /> Data e Hora
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      id="date_time"
                      name="date_time"
                      value={formData.date_time}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                    <FiPhone className="mr-1 text-orange-500" /> Contato
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="contact"
                      name="contact"
                      value={formData.contact || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {currentAppointment && (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                      <FiFilter className="mr-1 text-orange-500" /> Status
                    </label>
                    <div className="relative">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="scheduled">Agendado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <FiChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                    <FiMessageSquare className="mr-1 text-orange-500" /> Observações
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                      <FiMessageSquare className="text-gray-400" />
                    </div>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-h-[100px]"
                      placeholder="Observações sobre o agendamento..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg flex items-center transition-colors"
                >
                  <FiXCircle className="mr-2" /> Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg flex items-center transition-colors"
                >
                  {currentAppointment ? (
                    <>
                      <FiEdit className="mr-2" /> Atualizar
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" /> Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de agendamentos */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FiCalendar className="mr-2 text-orange-500" /> 
              Agendamentos para {dayjs(selectedDate).format('DD/MM/YYYY')}
            </h2>
            <span className="bg-orange-600/20 text-orange-400 text-sm px-3 py-1 rounded-full font-medium">
              {appointments.length} {appointments.length === 1 ? 'agendamento' : 'agendamentos'}
            </span>
          </div>
          
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-gray-800 border border-gray-700 rounded-xl p-10 shadow-lg">
              <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
                <FiCalendar className="text-gray-400" size={36} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum agendamento para hoje</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Não há agendamentos programados para esta data. Você pode criar um novo agendamento utilizando o botão acima.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md flex items-center transition-colors"
              >
                <FiPlus className="mr-2" /> Criar Agendamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map(appointment => {
                const statusColor = getStatusColor(appointment.status);
                const statusIcon = getStatusIcon(appointment.status);
                return (
                  <div 
                    key={appointment.id} 
                    className={`bg-gray-800 rounded-xl shadow-lg overflow-hidden border-l-4 ${statusColor.split(' ')[0]} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-white">{appointment.client_name}</h3>
                          <p className="text-sm text-gray-400 flex items-center mt-1">
                            <FiUser className="mr-1.5 text-orange-500" /> 
                            {appointment.user?.name || 'Barbeiro não definido'}
                          </p>
                        </div>
                        <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusIcon}
                          {appointment.status === 'scheduled' 
                            ? 'Agendado' 
                            : appointment.status === 'concluido'
                              ? 'Concluído'
                              : 'Cancelado'
                          }
                        </span>
                      </div>
                      
                      <div className="p-3 bg-gray-900/40 rounded-lg mb-4">
                        <div className="flex justify-between items-center">
                          <p className="font-medium flex items-center text-gray-200">
                            <FiScissors className="mr-2 text-orange-500" />
                            {appointment.service?.name || 'Serviço não definido'}
                          </p>
                          <p className="text-green-400 font-semibold flex items-center">
                            <FiDollarSign className="mr-0.5" />
                            {appointment.service?.price.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Duração: {appointment.service?.duration_minutes || 0} minutos
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3 text-gray-300">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gray-700/50 rounded-md mr-2">
                            <FiCalendar className="text-orange-500" size={14} />
                          </div>
                          <p className="text-sm">
                            {dayjs(appointment.date_time).format('DD/MM/YYYY')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gray-700/50 rounded-md mr-2">
                            <FiClock className="text-orange-500" size={14} />
                          </div>
                          <p className="text-sm">
                            {getAppointmentTime(appointment.date_time)}
                          </p>
                        </div>
                      </div>
                      
                      {appointment.contact && (
                        <p className="text-sm text-gray-400 mb-3 flex items-center">
                          <div className="p-1.5 bg-gray-700/50 rounded-md mr-2">
                            <FiPhone className="text-orange-500" size={14} />
                          </div>
                          {appointment.contact}
                        </p>
                      )}
                      
                      {appointment.notes && (
                        <div className="bg-gray-700/30 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-300 flex items-start">
                            <FiMessageSquare className="mr-2 mt-0.5 text-orange-500" /> 
                            <span>{appointment.notes}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-700">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="p-2 hover:bg-gray-700 rounded-md transition-colors text-blue-400 hover:text-blue-300"
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="p-2 hover:bg-gray-700 rounded-md transition-colors text-red-400 hover:text-red-300"
                          title="Cancelar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments; 