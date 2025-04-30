import api from './api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  user_type: string;
}

/**
 * Função para realizar login
 */
export const login = async (username: string, password: string) => {
  try {
    console.log('Tentando fazer login com:', username);
    const response = await api.post('/auth/login', 
      new URLSearchParams({
        'username': username,
        'password': password
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Resposta do login:', response.data);
    
    const { access_token, user } = response.data;
    
    // Salvar token e dados do usuário
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return true;
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Não foi possível fazer login. Verifique suas credenciais.');
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Verificar se o token expirou (implementação simples)
    // Em produção, seria recomendável usar uma biblioteca JWT para decodificar e verificar o token
    const user = getCurrentUser();
    return !!user;
  } catch (e) {
    console.error('Erro ao verificar autenticação:', e);
    return false;
  }
};

/**
 * Obtém os dados do usuário logado
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Erro ao obter dados do usuário:', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

// Buscar informações do usuário logado
export const getUserInfo = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  
  // Salvar usuário no localStorage
  localStorage.setItem('user', JSON.stringify(response.data));
  
  return response.data;
};

// Verificar se o usuário é admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user ? user.user_type === 'admin' : false;
};

// Fazer logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}; 