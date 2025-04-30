import api from './api';

// Interfaces
export interface Appointment {
  id?: number;
  client_name: string;
  user_id: number;
  service_id: number;
  date_time: string;
  status: string;
  contact?: string;
  notes?: string;
  user?: {
    id: number;
    name: string;
  };
  service?: {
    id: number;
    name: string;
    price: number;
    duration_minutes: number;
  };
}

// Serviços para gerenciar agendamentos
const appointmentService = {
  
  // Obter todos os agendamentos com filtros opcionais
  getAll: async (filters?: { 
    start_date?: string; 
    end_date?: string;
    user_id?: number;
    status?: string;
  }) => {
    const params = filters || {};
    const response = await api.get('/appointments/', { params });
    return response.data;
  },
  
  // Obter um agendamento específico
  getById: async (id: number) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  
  // Criar um novo agendamento
  create: async (appointment: Appointment) => {
    const response = await api.post('/appointments/', appointment);
    return response.data;
  },
  
  // Atualizar um agendamento existente
  update: async (id: number, appointment: Partial<Appointment>) => {
    const response = await api.put(`/appointments/${id}`, appointment);
    return response.data;
  },
  
  // Excluir um agendamento
  delete: async (id: number) => {
    await api.delete(`/appointments/${id}`);
  }
};

export default appointmentService; 