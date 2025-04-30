import { User } from './auth'; // Usar o tipo User consistente
import api from './api';

// Remover mapeamentos e tipo Barber local
// const mapUserToBarber = ...
// const mapBarberToUser = ...

export const fetchBarbeiros = async (): Promise<User[]> => {
  try {
    // Corrigir o endpoint para o que existe no backend
    const response = await api.get<User[]>('/users/users/');
    // Retornar diretamente os dados, pois UserResponse já tem os campos necessários
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    throw error; // Re-throw para tratamento no componente
  }
};

export const fetchBarbeiroById = async (id: string): Promise<User> => {
  try {
    // Corrigir endpoint
    const response = await api.get<User>(`/users/users/${id}`); 
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar barbeiro ${id}:`, error);
    throw error;
  }
};

// Interface para criação, omitindo id e campos não editáveis/backend-gerados
// Exportar interface
export interface UserCreatePayload { 
  name: string;
  email: string;
  password?: string; // Senha é obrigatória na criação
  user_type: 'admin' | 'barber';
  active?: boolean;
}

// Interface para atualização, todos os campos opcionais
// Exportar interface
export interface UserUpdatePayload { 
  name?: string;
  email?: string;
  password?: string;
  active?: boolean;
}

export const createBarbeiro = async (barbeiroData: UserCreatePayload): Promise<User> => {
  try {
    // Enviar dados no formato esperado por UserCreate do backend
    // Adicionar senha padrão se não fornecida (embora o backend exija)
    const payload = { 
      ...barbeiroData, 
      password: barbeiroData.password || 'fox123456', // Garantir senha
      user_type: 'barber' // Forçar tipo barbeiro
    };
    // Corrigir endpoint
    const response = await api.post<User>('/users/users/', payload); 
    return response.data;
  } catch (error) {
    console.error('Erro ao criar barbeiro:', error);
    throw error;
  }
};

export const updateBarbeiro = async (id: string, barbeiroData: UserUpdatePayload): Promise<User> => {
  try {
    // Enviar apenas os campos a serem atualizados (formato UserUpdate)
    // Corrigir endpoint
    const response = await api.put<User>(`/users/users/${id}`, barbeiroData); 
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar barbeiro ${id}:`, error);
    throw error;
  }
};

export const deleteBarbeiro = async (id: string): Promise<void> => {
  try {
    // Corrigir endpoint
    await api.delete(`/users/users/${id}`); 
  } catch (error) {
    console.error(`Erro ao excluir barbeiro ${id}:`, error);
    throw error;
  }
}; 