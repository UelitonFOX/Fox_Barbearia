import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface Service {
  id?: number;
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

interface ServiceFormProps {
  service?: Service;
  onClose: () => void;
  onSubmit: (service: ServiceFormData) => Promise<void>;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: 0,
    package_price: undefined,
    package_quantity: undefined,
    package_days: undefined,
    duration_minutes: 30,
    is_active: true
  });

  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});
  const [loading, setLoading] = useState(false);
  const [hasPackage, setHasPackage] = useState(false);

  useEffect(() => {
    if (service) {
      const { id, ...serviceData } = service;
      setFormData(serviceData);
      setHasPackage(!!service.package_price);
    }
  }, [service]);

  const validateForm = () => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (hasPackage) {
      if (!formData.package_price || formData.package_price <= 0) {
        newErrors.package_price = 'Preço do pacote deve ser maior que zero';
      }
      if (!formData.package_quantity || formData.package_quantity <= 0) {
        newErrors.package_quantity = 'Quantidade do pacote deve ser maior que zero';
      }
      if (!formData.package_days || formData.package_days <= 0) {
        newErrors.package_days = 'Duração do pacote deve ser maior que zero';
      }
    }

    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duração deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Se não tem pacote, remove os campos relacionados
      const submitData = {
        ...formData,
        package_price: hasPackage ? formData.package_price : undefined,
        package_quantity: hasPackage ? formData.package_quantity : undefined,
        package_days: hasPackage ? formData.package_days : undefined
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {service ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="Nome do serviço"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input w-full"
              placeholder="Descrição do serviço (opcional)"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preço</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input w-full"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              className="input w-full"
              placeholder="30"
              min="1"
            />
            {errors.duration_minutes && (
              <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasPackage"
              checked={hasPackage}
              onChange={(e) => setHasPackage(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600"
            />
            <label htmlFor="hasPackage" className="text-sm font-medium">
              Tem pacote promocional?
            </label>
          </div>

          {hasPackage && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Preço do Pacote</label>
                <input
                  type="number"
                  name="package_price"
                  value={formData.package_price}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.package_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.package_price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantidade no Pacote</label>
                <input
                  type="number"
                  name="package_quantity"
                  value={formData.package_quantity}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="2"
                  min="1"
                />
                {errors.package_quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.package_quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Validade do Pacote (dias)</label>
                <input
                  type="number"
                  name="package_days"
                  value={formData.package_days}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="15"
                  min="1"
                />
                {errors.package_days && (
                  <p className="text-red-500 text-sm mt-1">{errors.package_days}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm; 