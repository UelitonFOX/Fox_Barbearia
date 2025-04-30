import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '../services/auth';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

interface BarbeiroFormProps {
  barbeiro?: User;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BarbeiroForm: React.FC<BarbeiroFormProps> = ({ barbeiro, onSubmit, onCancel }): ReactNode => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!barbeiro;

  useEffect(() => {
    if (barbeiro) {
      setFormData({
        name: barbeiro.name,
        email: barbeiro.email,
        password: ''
      });
    } else {
      setFormData({ name: '', email: '', password: '' });
    }
  }, [barbeiro]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome completo é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'A senha é obrigatória';
    } else if (!isEditing && formData.password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="name">
          Nome completo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="text-gray-400" />
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full pl-10 px-3 py-2 bg-gray-700 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:ring-1 focus:ring-primary text-white`}
            placeholder="Nome completo do usuário"
          />
        </div>
        {errors.name && (
          <p className="text-red-400 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 px-3 py-2 bg-gray-700 border rounded-md ${
              errors.email ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:ring-1 focus:ring-primary text-white`}
            placeholder="email@exemplo.com"
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
          Senha {isEditing ? '(Deixe em branco para não alterar)' : ''}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 px-3 py-2 bg-gray-700 border rounded-md ${
              errors.password ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:ring-1 focus:ring-primary text-white`}
            placeholder={isEditing ? 'Nova senha (opcional)' : 'Senha (mínimo 6 caracteres)'}
          />
          <div 
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-white"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn"
        >
          {barbeiro ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
};

export default BarbeiroForm; 