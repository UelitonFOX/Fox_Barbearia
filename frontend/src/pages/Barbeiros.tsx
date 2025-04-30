import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiEdit, FiTrash, FiUsers } from 'react-icons/fi';
import { User } from '../services/auth';
import { 
  fetchBarbeiros, 
  createBarbeiro, 
  updateBarbeiro, 
  deleteBarbeiro, 
  UserCreatePayload,
  UserUpdatePayload 
} from '../services/barbeiro';
import { isAdmin } from '../services/auth';
import BarbeiroForm from '../components/BarbeiroForm';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const Barbeiros: React.FC = () => {
  const [barbeiros, setBarbeiros] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<User | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  // Verificar permissões e carregar dados ao iniciar
  useEffect(() => {
    setUserIsAdmin(isAdmin());
    loadBarbeiros();
  }, []);

  // Carregar lista de barbeiros
  const loadBarbeiros = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBarbeiros();
      setBarbeiros(data);
    } catch (err) {
      setError('Erro ao carregar barbeiros. Por favor, tente novamente.');
      console.error('Erro ao carregar barbeiros:', err);
      toast.error('Não foi possível carregar a lista de barbeiros.');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo barbeiro (abre formulário)
  const handleAddBarbeiro = () => {
    setSelectedBarbeiro(null);
    setShowForm(true);
  };

  // Editar barbeiro existente (abre formulário)
  const handleEditBarbeiro = (barbeiro: User) => {
    setSelectedBarbeiro(barbeiro);
    setShowForm(true);
  };

  // Excluir barbeiro
  const handleDeleteBarbeiro = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }
    
    try {
      await deleteBarbeiro(String(id));
      setBarbeiros(barbeiros.filter(b => b.id !== id));
      toast.success('Usuário excluído com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao excluir usuário. Tente novamente.';
      toast.error(errorMessage);
    }
  };

  // Fechar formulário
  const handleCancel = () => {
    setShowForm(false);
  };

  // Enviar formulário (criar ou atualizar)
  // Receber dados do formulário (tipo any por simplicidade do BarbeiroForm)
  const handleSubmit = async (formData: any) => { 
    try {
      if (selectedBarbeiro) {
        // Atualizar barbeiro
        const payload: UserUpdatePayload = { name: formData.name, email: formData.email };
        // Incluir senha apenas se foi preenchida no formulário
        if (formData.password) {
          payload.password = formData.password;
        }
        const updated = await updateBarbeiro(String(selectedBarbeiro.id), payload);
        setBarbeiros(barbeiros.map(b => b.id === selectedBarbeiro.id ? updated : b)); 
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Adicionar novo barbeiro
        // Garantir que os campos de UserCreatePayload estão presentes
        const payload: UserCreatePayload = {
          name: formData.name,
          email: formData.email,
          password: formData.password, // Senha é obrigatória aqui
          user_type: 'barber' // Definir tipo padrão
        };
        const created = await createBarbeiro(payload);
        setBarbeiros([...barbeiros, created]);
        toast.success('Usuário adicionado com sucesso!');
      }
      setShowForm(false);
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao salvar usuário. Tente novamente.';
      toast.error(errorMessage);
    }
  };

  // Componente de cartão de barbeiro
  const BarbeiroCard = ({ barbeiro }: { barbeiro: User }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">{barbeiro.full_name}</h3>
      <p className="text-gray-600 mb-2">{barbeiro.email}</p>
      
      {userIsAdmin && (
        <div className="flex mt-4">
          <button 
            onClick={() => handleEditBarbeiro(barbeiro)}
            className="flex items-center mr-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <FiEdit className="mr-1" /> Editar
          </button>
          <button 
            onClick={() => handleDeleteBarbeiro(barbeiro.id)}
            className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <FiTrash className="mr-1" /> Excluir
          </button>
        </div>
      )}
    </div>
  );

  // Exibir carregamento
  if (loading && barbeiros.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Usuários</h1>
        <Spinner message="Carregando usuários..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <div className="flex">
          <button
            onClick={loadBarbeiros}
            className="flex items-center mr-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <FiRefreshCw className="mr-2" /> Atualizar
          </button>
          
          {userIsAdmin && (
            <button
              onClick={handleAddBarbeiro}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              <FiPlus className="mr-2" /> Novo Usuário
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {showForm ? (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {selectedBarbeiro ? 'Editar Barbeiro' : 'Adicionar Barbeiro'}
          </h2>
          <BarbeiroForm
            barbeiro={selectedBarbeiro || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          {barbeiros.length === 0 ? (
            <div className="text-center py-10">
              <FiUsers className="mx-auto text-4xl text-gray-400 mb-4" /> 
              <p className="text-gray-500 mb-4">Nenhum usuário cadastrado.</p>
              {userIsAdmin && (
                <button
                  onClick={handleAddBarbeiro}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  <FiPlus className="inline mr-1" /> Adicionar Usuário
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbeiros.map(barbeiro => (
                <BarbeiroCard key={barbeiro.id} barbeiro={barbeiro} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Barbeiros; 