import apiClient from './api';
import { UserPasswordUpdate } from '../types/user'; // Precisaremos criar este tipo

/**
 * Atualiza a senha do usuário logado.
 */
export const updatePassword = async (data: UserPasswordUpdate): Promise<void> => {
  try {
    await apiClient.put('/users/me/password', data);
  } catch (error) {
    // O apiClient já deve tratar erros e lançá-los
    console.error("Erro ao atualizar senha:", error);
    throw error; // Re-lança para ser tratado no componente
  }
}; 