import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiEdit, FiTrash, FiUsers, FiUserPlus, FiMail, FiUserCheck, FiShield } from 'react-icons/fi';
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
      setError('Erro ao carregar usuários. Por favor, tente novamente.');
      console.error('Erro ao carregar usuários:', err);
      toast.error('Não foi possível carregar a lista de usuários.');
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
  const BarbeiroCard = ({ barbeiro }: { barbeiro: User }) => {
    // Determinar cor da borda baseada no tipo de usuário
    const getBorderColor = () => {
      return barbeiro.user_type === 'admin' 
        ? 'border-amber-500' 
        : 'border-blue-500';
    };

    // Renderização adaptada ao novo tema escuro
    return (
      <div className={`card bg-gray-800 p-4 border-l-4 ${getBorderColor()} transition-all hover:shadow-lg hover:bg-gray-800/80`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FiUserCheck className="mr-2 text-primary" />
              {barbeiro.name}
            </h3>
            <p className="text-gray-400 flex items-center mt-1">
              <FiMail className="mr-2" /> {barbeiro.email}
            </p>
          </div>
          
          <div className="px-2 py-1 rounded-full bg-gray-700/50 text-xs font-medium flex items-center">
            {barbeiro.user_type === 'admin' ? (
              <span className="text-amber-400 flex items-center">
                <FiShield className="mr-1" /> Administrador
              </span>
            ) : (
              <span className="text-blue-400 flex items-center">
                <FiUsers className="mr-1" /> Barbeiro
              </span>
            )}
          </div>
        </div>
        
        {userIsAdmin && (
          <div className="flex mt-4 justify-end">
            <button 
              onClick={() => handleEditBarbeiro(barbeiro)}
              className="btn-icon mr-2"
              title="Editar usuário"
            >
              <FiEdit />
            </button>
            <button 
              onClick={() => handleDeleteBarbeiro(barbeiro.id)}
              className="btn-icon hover:text-red-500"
              title="Excluir usuário"
            >
              <FiTrash />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Exibir carregamento
  if (loading && barbeiros.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner message="Carregando usuários..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-md text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FiUsers className="mr-2 text-primary" /> Usuários
        </h1>
        <div className="flex">
          <button
            onClick={loadBarbeiros}
            className="btn-secondary flex items-center mr-2"
            title="Atualizar lista"
          >
            <FiRefreshCw className="mr-2" /> Atualizar
          </button>
          
          {userIsAdmin && (
            <button
              onClick={handleAddBarbeiro}
              className="btn flex items-center"
              title="Adicionar novo usuário"
            >
              <FiUserPlus className="mr-2" /> Novo Usuário
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 p-4 rounded-md mb-6">
          <span className="text-white">{error}</span>
        </div>
      )}

      {showForm ? (
        <div className="card bg-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUserPlus className="mr-2 text-primary" />
            {selectedBarbeiro ? 'Editar Usuário' : 'Adicionar Usuário'}
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
            <div className="text-center py-10 card bg-gray-800 border border-gray-700">
              <FiUsers className="mx-auto text-4xl text-gray-500 mb-4" /> 
              <p className="text-gray-300 mb-4">Nenhum usuário cadastrado.</p>
              {userIsAdmin && (
                <button
                  onClick={handleAddBarbeiro}
                  className="btn inline-flex items-center"
                >
                  <FiUserPlus className="mr-2" /> Adicionar Usuário
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-400">
                  Total: <span className="text-white font-medium">{barbeiros.length} usuários</span>
                </p>
                <div className="flex">
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-900/20 text-amber-400 mr-2 flex items-center">
                    <FiShield className="mr-1" /> {barbeiros.filter(b => b.user_type === 'admin').length} admins
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-900/20 text-blue-400 flex items-center">
                    <FiUsers className="mr-1" /> {barbeiros.filter(b => b.user_type === 'barber').length} barbeiros
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {barbeiros.map(barbeiro => (
                  <BarbeiroCard key={barbeiro.id} barbeiro={barbeiro} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Barbeiros; 