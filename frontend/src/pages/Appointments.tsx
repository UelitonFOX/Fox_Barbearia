import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getCurrentUser, isAdmin } from '../services/auth';
import api from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

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
      const response = await api.get('/users');
      
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  // Renderização condicionada ao carregamento
  if (isLoading && appointments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Agenda</h1>
        <div className="text-center py-10">
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  // Renderização em caso de erro
  if (error && appointments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Agenda</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={loadAppointments}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="date" className="font-medium">Data:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded flex items-center hover:bg-primary-dark transition"
          >
            <FiPlus className="mr-2" /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Formulário de agendamento */}
      {showForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="client_name" className="block text-sm font-medium mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="user_id" className="block text-sm font-medium mb-1">
                  Barbeiro
                </label>
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                  disabled={!userIsAdmin} // Apenas admin pode trocar barbeiro
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione o barbeiro</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="service_id" className="block text-sm font-medium mb-1">
                  Serviço
                </label>
                <select
                  id="service_id"
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione o serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="date_time" className="block text-sm font-medium mb-1">
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  id="date_time"
                  name="date_time"
                  value={formData.date_time}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {currentAppointment && (
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="scheduled">Agendado</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
              >
                {currentAppointment ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de agendamentos */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Agendamentos para {dayjs(selectedDate).format('DD/MM/YYYY')}
        </h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <FiCalendar className="mx-auto text-4xl text-gray-400 mb-3" />
            <p className="text-gray-500">Nenhum agendamento para esta data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map(appointment => (
              <div 
                key={appointment.id} 
                className={`bg-white shadow-md rounded-lg p-4 border-l-4 ${
                  appointment.status === 'concluido' 
                    ? 'border-green-500' 
                    : appointment.status === 'cancelado'
                      ? 'border-red-500'
                      : 'border-primary'
                }`}
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{appointment.client_name}</h3>
                  <p className="text-sm text-gray-600">
                    <FiUser className="inline mr-1" /> 
                    {appointment.user?.name || 'Barbeiro não definido'}
                  </p>
                </div>
                
                <div className="mb-3">
                  <p className="font-medium">{appointment.service?.name || 'Serviço não definido'}</p>
                  <p className="text-sm text-gray-600">
                    R$ {appointment.service?.price.toFixed(2) || '0.00'}
                  </p>
                </div>
                
                <div className="mb-3 flex gap-3">
                  <div>
                    <p className="text-sm text-gray-700">
                      <FiCalendar className="inline mr-1" /> 
                      {dayjs(appointment.date_time).format('DD/MM/YYYY')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      <FiClock className="inline mr-1" /> 
                      {dayjs(appointment.date_time).format('HH:mm')}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    appointment.status === 'scheduled' 
                      ? 'bg-blue-100 text-blue-800' 
                      : appointment.status === 'concluido'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status === 'scheduled' 
                      ? 'Agendado' 
                      : appointment.status === 'concluido'
                        ? 'Concluído'
                        : 'Cancelado'
                    }
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-1 hover:text-primary transition"
                      title="Editar"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="p-1 hover:text-red-500 transition"
                      title="Cancelar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments; 