import { Barber } from '../services/supabase';
import { FiEdit2, FiTrash2, FiPhone, FiMail } from 'react-icons/fi';

interface BarbeiroCardProps {
  barber: Barber;
  onEdit: (barber: Barber) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const BarbeiroCard: React.FC<BarbeiroCardProps> = ({ barber, onEdit, onDelete, isAdmin }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{barber.nome}</h3>
          
          {isAdmin && (
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit(barber)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Editar"
              >
                <FiEdit2 />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`Tem certeza que deseja excluir ${barber.nome}?`)) {
                    onDelete(barber.id!);
                  }
                }}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Excluir"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>
        
        {barber.especialidade && (
          <div className="mb-2">
            <span className="inline-block bg-primary-light text-primary text-xs px-2 py-1 rounded-full">
              {barber.especialidade}
            </span>
          </div>
        )}
        
        <div className="mt-4 space-y-1">
          {barber.email && (
            <div className="flex items-center text-sm text-gray-600">
              <FiMail className="mr-2" />
              <a href={`mailto:${barber.email}`} className="hover:underline">
                {barber.email}
              </a>
            </div>
          )}
          
          {barber.telefone && (
            <div className="flex items-center text-sm text-gray-600">
              <FiPhone className="mr-2" />
              <a href={`tel:${barber.telefone.replace(/\D/g, '')}`} className="hover:underline">
                {barber.telefone}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarbeiroCard; 