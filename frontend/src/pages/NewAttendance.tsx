import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiPercent, FiTag, FiClock, FiUser, FiCreditCard } from 'react-icons/fi';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { getCurrentUser } from '../services/auth';

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

interface User {
  id: number;
  name: string;
  username: string;
}

interface AttendanceFormData {
  user_id: number;
  service_id: number;
  original_value: number;
  discount_amount: number;
  final_value: number;
  payment_method: string;
}

const NewAttendance = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<AttendanceFormData>({
    user_id: 0,
    service_id: 0,
    original_value: 0,
    discount_amount: 0,
    final_value: 0,
    payment_method: 'pix'
  });
  
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  // Carregar serviços e usuários ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carregar serviços
        const servicesResponse = await api.get('/services/');
        const activeServices = servicesResponse.data.filter((s: Service) => s.is_active);
        setServices(activeServices || []);
        
        // Carregar usuários (apenas admin)
        if (currentUser?.is_admin) {
          const usersResponse = await api.get('/users/users/');
          setUsers(usersResponse.data || []);
        }
        
        // Pré-selecionar o usuário atual
        setFormData(prev => ({
          ...prev,
          user_id: currentUser?.id || 0
        }));
        
        setError('');
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados necessários.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Atualizar valores quando o serviço for selecionado
  const handleServiceChange = (serviceId: number) => {
    const service = services.find(s => s.id === parseInt(serviceId.toString()));
    
    if (service) {
      setFormData({
        ...formData,
        service_id: service.id,
        original_value: service.price,
        discount_amount: 0,
        final_value: service.price
      });
    }
  };
  
  // Atualizar valor final quando o desconto for alterado
  const handleDiscountChange = (discount: number) => {
    const discountValue = isNaN(discount) ? 0 : discount;
    const finalValue = Math.max(0, formData.original_value - discountValue);
    
    setFormData({
      ...formData,
      discount_amount: discountValue,
      final_value: finalValue
    });
  };
  
  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.service_id === 0) {
      setError('Selecione um serviço.');
      return;
    }
    
    if (formData.final_value <= 0) {
      setError('O valor final deve ser maior que zero.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await api.post('/attendances/', formData);
      
      // Redirecionar para a lista de atendimentos
      navigate('/atendimentos');
    } catch (err: any) {
      console.error('Erro ao registrar atendimento:', err);
      setError('Não foi possível registrar o atendimento.');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-primary text-lg">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/atendimentos')}
          className="p-2 rounded-full hover:bg-gray-800 transition mr-2"
          title="Voltar"
        >
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Novo Atendimento</h1>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 p-4 rounded-md mb-6">
          <p className="text-white">{error}</p>
        </div>
      )}
      
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Serviço */}
          <div>
            <label className="block text-gray-400 mb-2 font-medium">
              <FiTag className="inline mr-2" /> Serviço
            </label>
            <select
              className="input w-full"
              value={formData.service_id}
              onChange={(e) => handleServiceChange(parseInt(e.target.value))}
              required
            >
              <option value="0">Selecione um serviço</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {formatCurrency(service.price)} - {service.duration_minutes} min
                </option>
              ))}
            </select>
          </div>
          
          {/* Usuário (apenas admin) */}
          {currentUser?.is_admin && (
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                <FiUser className="inline mr-2" /> Barbeiro
              </label>
              <select
                className="input w-full"
                value={formData.user_id}
                onChange={(e) => setFormData({...formData, user_id: parseInt(e.target.value)})}
                required
              >
                <option value="0">Selecione um barbeiro</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                <FiDollarSign className="inline mr-2" /> Valor Original
              </label>
              <input
                type="number"
                className="input w-full bg-gray-700 cursor-not-allowed"
                value={formData.original_value}
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                <FiPercent className="inline mr-2" /> Desconto
              </label>
              <input
                type="number"
                className="input w-full"
                placeholder="0.00"
                min="0"
                max={formData.original_value}
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) => handleDiscountChange(parseFloat(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                <FiDollarSign className="inline mr-2" /> Valor Final
              </label>
              <input
                type="number"
                className="input w-full bg-gray-700 font-bold text-green-500"
                value={formData.final_value}
                readOnly
              />
            </div>
          </div>
          
          {/* Forma de Pagamento */}
          <div>
            <label className="block text-gray-400 mb-2 font-medium">
              <FiCreditCard className="inline mr-2" /> Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['pix', 'card', 'cash'].map(method => {
                const labels = { pix: 'PIX', card: 'Cartão', cash: 'Dinheiro' };
                return (
                  <label
                    key={method}
                    className={`
                      flex items-center justify-center p-3 rounded-md transition cursor-pointer
                      ${formData.payment_method === method 
                        ? 'bg-primary/30 border border-primary text-white' 
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'}
                    `}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      className="sr-only"
                      checked={formData.payment_method === method}
                      onChange={() => setFormData({...formData, payment_method: method})}
                    />
                    {labels[method as keyof typeof labels]}
                  </label>
                );
              })}
            </div>
          </div>
          
          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => navigate('/atendimentos')}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn"
              disabled={submitting || formData.service_id === 0 || formData.final_value <= 0}
            >
              {submitting ? 'Salvando...' : 'Salvar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAttendance; 