import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { updatePassword } from '../services/user';
import Spinner from '../components/Spinner';
import { AxiosError } from 'axios';
import { getCurrentUser, User } from '../services/auth';
import { FiUser, FiLock, FiMail, FiShield, FiEdit, FiCheck, FiAlertCircle } from 'react-icons/fi';

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
  const [showSuccess, setShowSuccess] = useState(false);

  // Buscar dados do usuário ao montar o componente
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Mostrar mensagem de sucesso por 5 segundos
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(refinedPasswordSchema),
    mode: 'onChange'
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
      setShowSuccess(true);
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
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-400">Carregando informações do perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-bold mb-10 text-center text-white relative">
          <span className="relative inline-block">
            Meu Perfil
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-700 rounded"></span>
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cartão de perfil */}
          <div className="col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 h-full transform transition-all duration-300 hover:shadow-orange-900/20 hover:shadow-2xl">
              <div className="bg-gradient-to-r from-orange-800 to-orange-600 p-6 text-center">
                <div className="mx-auto bg-white/10 rounded-full p-3 mb-4 w-24 h-24 flex items-center justify-center backdrop-blur-sm">
                  <FiUser className="text-white h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{currentUser.name}</h2>
                <p className="text-orange-200">@{currentUser.username}</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-gray-700/50 rounded-lg p-2 mr-3">
                      <FiMail className="text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</h3>
                      <p className="text-gray-200 font-medium">{currentUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gray-700/50 rounded-lg p-2 mr-3">
                      <FiShield className="text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo de Conta</h3>
                      <p className="text-gray-200 font-medium capitalize">
                        {currentUser.user_type === 'admin' ? 'Administrador' : 'Barbeiro'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    <p className="mb-2 flex items-center">
                      <FiCheck className="text-green-500 mr-2" /> Perfil verificado
                    </p>
                    <p className="mb-1 flex items-start">
                      <FiAlertCircle className="text-orange-500 mr-2 mt-0.5" /> 
                      <span>
                        É importante manter sua senha segura. Troque-a regularmente e não a compartilhe com outras pessoas.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Alteração de Senha */}
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:shadow-orange-900/20 hover:shadow-2xl">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center border-b border-gray-700 pb-4">
                  <FiLock className="mr-3 text-orange-500"/> 
                  Alterar Senha
                </h3>
                
                {showSuccess && (
                  <div className="mb-6 bg-green-900/50 border border-green-800 rounded-lg p-4 text-green-200 flex items-start">
                    <FiCheck className="mr-2 mt-1 text-green-400" size={18} />
                    <div>
                      <h4 className="font-semibold">Senha atualizada com sucesso!</h4>
                      <p className="text-sm text-green-300">Sua senha foi alterada com segurança.</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-5">
                  {/* Senha Atual */}
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="current_password"
                        {...register('current_password')}
                        className="w-full pl-3 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                        disabled={isLoading}
                        placeholder="Digite sua senha atual"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FiLock className="text-gray-400" size={16} />
                      </div>
                    </div>
                    {errors.current_password && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <FiAlertCircle className="mr-1" size={14} /> 
                        {errors.current_password.message}
                      </p>
                    )}
                  </div>

                  {/* Nova Senha */}
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="new_password"
                        {...register('new_password')}
                        className="w-full pl-3 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                        disabled={isLoading}
                        placeholder="Digite sua nova senha"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FiLock className="text-gray-400" size={16} />
                      </div>
                    </div>
                    {errors.new_password && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <FiAlertCircle className="mr-1" size={14} /> 
                        {errors.new_password.message}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      A senha deve ter no mínimo 8 caracteres
                    </p>
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirm_password"
                        {...register('confirm_password')}
                        className="w-full pl-3 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                        disabled={isLoading}
                        placeholder="Confirme sua nova senha"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FiLock className="text-gray-400" size={16} />
                      </div>
                    </div>
                    {errors.confirm_password && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <FiAlertCircle className="mr-1" size={14} /> 
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  {/* Dicas e Botão */}
                  <div className="pt-2">
                    <div className="mb-5 bg-gray-700/50 p-4 rounded-lg text-sm">
                      <h4 className="font-semibold text-gray-300 mb-2 flex items-center">
                        <FiShield className="mr-2 text-orange-500" /> Dicas para uma senha forte:
                      </h4>
                      <ul className="text-gray-400 space-y-1 ml-1">
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2 text-xs">●</span> 
                          Use uma combinação de letras, números e símbolos
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2 text-xs">●</span> 
                          Evite informações pessoais óbvias (nome, data de nascimento)
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-500 mr-2 text-xs">●</span> 
                          Não reutilize senhas de outros serviços
                        </li>
                      </ul>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !isValid || !isDirty}
                      className="w-full flex justify-center items-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Spinner size="sm" />
                          <span className="ml-2">Processando...</span>
                        </>
                      ) : (
                        <>
                          <FiEdit className="mr-2" />
                          Salvar Nova Senha
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 