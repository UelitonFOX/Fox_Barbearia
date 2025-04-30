import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '../services/auth';

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
  const isEditing = !!barbeiro;

  useEffect(() => {
    if (barbeiro) {
      setFormData({
        name: barbeiro.full_name,
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Nome completo
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-1 focus:ring-primary`}
          placeholder="Nome completo do usuário"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-1 focus:ring-primary`}
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Senha {isEditing ? '(Deixe em branco para não alterar)' : ''}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-1 focus:ring-primary`}
          placeholder={isEditing ? 'Nova senha (opcional)' : 'Senha (mínimo 6 caracteres)'}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          {barbeiro ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
};

export default BarbeiroForm; 