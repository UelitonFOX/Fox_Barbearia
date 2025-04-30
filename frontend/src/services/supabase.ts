// Serviço para comunicação com o Supabase usando fetch

// URL e chave do Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Headers básicos para todas as requisições
const getHeaders = () => {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
};

// Interface para o barbeiro
export interface Barber {
  id?: string;
  nome: string;
  email: string;
  telefone?: string;
  especialidade?: string;
  criado_em?: string;
}

// Serviço de barbeiros
const barberService = {
  // Listar todos os barbeiros
  async getAll(): Promise<Barber[]> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/barbeiros?select=*`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar barbeiros: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      throw error;
    }
  },

  // Buscar um barbeiro específico pelo ID
  async getById(id: string): Promise<Barber> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/barbeiros?id=eq.${id}&select=*`, 
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar barbeiro: ${response.status}`);
      }

      const data = await response.json();
      return data[0]; // Supabase retorna um array mesmo para um único resultado
    } catch (error) {
      console.error('Erro ao buscar barbeiro por ID:', error);
      throw error;
    }
  },

  // Criar um novo barbeiro
  async create(barber: Barber): Promise<Barber> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/barbeiros`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(barber)
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar barbeiro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar barbeiro:', error);
      throw error;
    }
  },

  // Atualizar um barbeiro existente
  async update(id: string, barber: Partial<Barber>): Promise<Barber> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/barbeiros?id=eq.${id}`, 
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(barber)
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao atualizar barbeiro: ${response.status}`);
      }

      // Buscar o objeto atualizado
      return await this.getById(id);
    } catch (error) {
      console.error('Erro ao atualizar barbeiro:', error);
      throw error;
    }
  },

  // Excluir um barbeiro
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/barbeiros?id=eq.${id}`, 
        {
          method: 'DELETE',
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao excluir barbeiro: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao excluir barbeiro:', error);
      throw error;
    }
  }
};

export default barberService; 