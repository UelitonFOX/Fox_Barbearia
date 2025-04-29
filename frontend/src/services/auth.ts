import api from './api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'barbeiro';
  active: boolean;
}

// Fazer login
export const login = async (credentials: LoginCredentials): Promise<User> => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await api.post<LoginResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Salvar token no localStorage
  localStorage.setItem('token', response.data.access_token);

  // Buscar informações do usuário
  return getUserInfo();
};

// Obter informações do usuário logado
export const getUserInfo = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  
  // Salvar informações do usuário no localStorage
  localStorage.setItem('user', JSON.stringify(response.data));
  
  return response.data;
};

// Verificar se o usuário está logado
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Obter usuário atual (do localStorage)
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Verificar se o usuário é admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return !!user && user.user_type === 'admin';
};

// Fazer logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}; 