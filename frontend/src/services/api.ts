import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Criar instância do axios com configurações básicas
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Aumentar o timeout para dar mais tempo para a resposta
  timeout: 10000,
});

// Função para verificar se a API está acessível
export const checkApiHealth = async () => {
  try {
    console.log('Verificando saúde da API...');
    const response = await api.get('/health', { timeout: 5000 });
    console.log('Estado da API:', response.data);
    return {
      healthy: true,
      message: response.data.message || 'API funcionando normalmente'
    };
  } catch (error) {
    console.error('API indisponível:', error);
    return {
      healthy: false,
      message: 'Não foi possível conectar ao servidor'
    };
  }
};

// Interceptor para adicionar token a todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Logging em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    // Logging em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Logging detalhado do erro
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Se o erro for 401 (não autorizado), redirecionar para login
    if (error.response && error.response.status === 401) {
      console.log('Sessão expirada. Redirecionando para login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    // Se for erro de conexão ou timeout, mostrar mensagem adequada
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Erro de conexão com o servidor. Verifique se o backend está em execução.');
    }
    
    return Promise.reject(error);
  }
);

export default api; 