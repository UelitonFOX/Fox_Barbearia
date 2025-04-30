import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { updatePassword } from '../services/user';
import Spinner from '../components/Spinner';
import { AxiosError } from 'axios';
import { getCurrentUser, User } from '../services/auth';
import { FiUser, FiLock } from 'react-icons/fi';

// Schema de validação com Zod
const passwordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
  confirm_password: z.string()
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// Adicionar refinamento após a definição do tipo para evitar referência circular
const refinedPasswordSchema = passwordSchema.refine(
  (data: PasswordFormData) => data.new_password === data.confirm_password,
  {
    message: 'As senhas não coincidem',
    path: ['confirm_password'],
  }
);

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Buscar dados do usuário ao montar o componente
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(refinedPasswordSchema),
  });

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      // Prepara os dados removendo a confirmação de senha
      const updateData = {
        current_password: data.current_password,
        new_password: data.new_password,
      };

      await updatePassword(updateData);
      toast.success('Senha atualizada com sucesso!');
      reset(); // Limpa o formulário
    } catch (err) {
      console.error("Erro ao atualizar senha:", err);
      let errorMessage = 'Falha ao atualizar a senha. Tente novamente.';

      // Type Guarding para tratar erro unknown
      if (err instanceof AxiosError) {
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail as string;
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      // Se não for AxiosError nem Error, usa a mensagem padrão.

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Se os dados do usuário ainda não carregaram, pode mostrar um loading ou nada
  if (!currentUser) {
    return <div className="container mx-auto p-4 text-center"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Meu Perfil</h1>

      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-2xl mx-auto">
        {/* Seção de Informações */}
        <div className="p-6 md:p-8 border-b border-gray-700">
          <div className="flex items-center mb-6">
            <div className="bg-orange-600 rounded-full p-3 mr-4">
              <FiUser className="text-white h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{currentUser.name}</h2>
              <p className="text-gray-400">@{currentUser.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
              <p className="text-gray-200 mt-1">{currentUser.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Conta</label>
              <p className="text-gray-200 mt-1 capitalize">{currentUser.user_type}</p>
            </div>
            {/* Adicionar mais campos aqui se necessário */}
          </div>
        </div>

        {/* Seção de Alteração de Senha */}
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-semibold mb-5 text-white flex items-center">
             <FiLock className="mr-2 text-orange-500"/> Alterar Senha
          </h3>
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
             {/* Senha Atual */}
             <div>
               <label htmlFor="current_password" className="block text-sm font-medium text-gray-300 mb-1">
                 Senha Atual
               </label>
               <input
                 type="password"
                 id="current_password"
                 {...register('current_password')}
                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 disabled={isLoading}
               />
               {errors.current_password && (
                 <p className="text-red-500 text-xs mt-1">{errors.current_password.message}</p>
               )}
             </div>

             {/* Nova Senha */}
             <div>
               <label htmlFor="new_password" className="block text-sm font-medium text-gray-300 mb-1">
                 Nova Senha
               </label>
               <input
                 type="password"
                 id="new_password"
                 {...register('new_password')}
                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 disabled={isLoading}
               />
               {errors.new_password && (
                 <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>
               )}
             </div>

             {/* Confirmar Nova Senha */}
             <div>
               <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300 mb-1">
                 Confirmar Nova Senha
               </label>
               <input
                 type="password"
                 id="confirm_password"
                 {...register('confirm_password')}
                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 disabled={isLoading}
               />
               {errors.confirm_password && (
                 <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
               )}
             </div>

             {/* Botão */}
             <button
               type="submit"
               disabled={isLoading}
               className="w-full flex justify-center items-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
             >
               {isLoading ? <Spinner size="sm" /> : 'Salvar Nova Senha'}
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 