import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import ServiceForm from '../components/ServiceForm';
import { isAdmin } from '../services/auth';

interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  package_price?: number;
  package_quantity?: number;
  package_days?: number;
  duration_minutes: number;
  is_active: boolean;
}

type ServiceFormData = Omit<Service, 'id'>;

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const userIsAdmin = isAdmin();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      console.log("Tentando carregar serviços...");
      const response = await api.get('/services/');
      console.log("Resposta da API:", response);
      setServices(response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar serviços:', err);
      console.log("Detalhes do erro:", err?.response?.data);
      
      // Verifica se a estrutura da tabela pode estar errada
      if (err?.response?.status === 500) {
        setError('Erro ao carregar serviços. A estrutura da tabela pode estar incorreta. Tente inicializar os serviços.');
        setServices([]);
      } else {
        setError('Não foi possível carregar a lista de serviços.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeServices = async () => {
    try {
      await api.post('/services/initialize/');
      await loadServices();
    } catch (err) {
      console.error('Erro ao inicializar serviços:', err);
      setError('Não foi possível inicializar os serviços.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este serviço?')) {
      return;
    }

    try {
      await api.delete(`/services/${id}`);
      await loadServices();
    } catch (err) {
      console.error('Erro ao remover serviço:', err);
      setError('Não foi possível remover o serviço.');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleSubmit = async (serviceData: ServiceFormData) => {
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, serviceData);
      } else {
        await api.post('/services/', serviceData);
      }
      await loadServices();
      setShowForm(false);
      setEditingService(null);
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary text-lg">Carregando serviços...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 p-4 rounded-md">
        <p className="text-white">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Serviços</h1>
        {userIsAdmin && (
          <div className="space-x-2">
            <button 
              onClick={() => setShowForm(true)}
              className="btn flex items-center"
            >
              <FiPlus className="mr-1" /> Novo Serviço
            </button>
            <button 
              onClick={handleInitializeServices}
              className="btn-secondary flex items-center"
            >
              <FiPackage className="mr-1" /> {services.length === 0 ? 'Inicializar Serviços' : 'Verificar Serviços'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <div 
            key={service.id} 
            className={`card p-4 ${!service.is_active ? 'opacity-50' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{service.name}</h3>
                {service.description && (
                  <p className="text-gray-400 text-sm">{service.description}</p>
                )}
              </div>
              {userIsAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 rounded-full hover:bg-gray-700 transition"
                    title="Editar"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 rounded-full hover:bg-gray-700 transition text-red-500"
                    title="Remover"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Preço:</span>
                <span className="font-semibold">{formatCurrency(service.price)}</span>
              </div>

              {service.package_price && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    Pacote ({service.package_quantity}x em {service.package_days} dias):
                  </span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(service.package_price)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Duração:</span>
                <span>{service.duration_minutes} minutos</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && userIsAdmin && (
        <ServiceForm
          service={editingService || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingService(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Services; 