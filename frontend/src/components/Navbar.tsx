import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAdmin } from '../services/auth';
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiScissors, FiBarChart2, FiUsers, FiSettings, FiClock, FiPieChart, FiGrid, FiClipboard, FiTrendingUp, FiTool } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userIsAdmin = isAdmin();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-primary font-bold text-xl">🦊 Fox Barbearia</span>
          </div>

          {/* Menu de Navegação - Desktop */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/dashboard" className="hover:text-primary transition">
              <FiBarChart2 className="inline mr-1" /> Dashboard
            </Link>
            <Link to="/atendimentos" className="hover:text-primary transition">
              <FiScissors className="inline mr-1" /> Atendimentos
            </Link>
            <Link to="/atendimentos/hoje" className="hover:text-primary transition">
              <FiClock className="inline mr-1" /> Hoje
            </Link>
            <Link to="/agenda" className="hover:text-primary transition">
              <FiCalendar className="inline mr-1" /> Agenda
            </Link>
            <Link to="/servicos" className="hover:text-primary transition">
              <FiSettings className="inline mr-1" /> Serviços
            </Link>
            <Link to="/relatorios" className="hover:text-primary transition">
              <FiPieChart className="inline mr-1" /> Relatórios
            </Link>
            {userIsAdmin && (
              <>
                <Link to="/usuarios" className="hover:text-primary transition">
                  <FiUsers className="inline mr-1" /> Usuários
                </Link>
              </>
            )}
            <div className="ml-4 pl-4 border-l border-gray-700 flex items-center">
              <Link to="/perfil" className="text-sm font-medium hover:text-orange-400 transition duration-200">
                 {user?.username || user?.name}
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition ml-3"
                title="Sair"
              >
                <FiLogOut />
              </button>
            </div>
          </div>

          {/* Botão do Menu - Mobile */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu} 
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 pb-4">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <div className="flex items-center">
                <FiUser className="text-primary mr-2" />
                <Link to="/perfil" className="text-sm font-medium hover:text-orange-400 transition duration-200">
                  {user?.username || user?.name}
                </Link>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                title="Sair"
              >
                <FiLogOut />
              </button>
            </div>
            <div className="pt-2 flex flex-col space-y-3">
              <Link to="/dashboard" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                <FiBarChart2 className="inline mr-2" /> Dashboard
              </Link>
              <Link to="/atendimentos" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                <FiScissors className="inline mr-2" /> Atendimentos
              </Link>
              <Link to="/atendimentos/hoje" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                <FiClock className="inline mr-2" /> Hoje
              </Link>
              <Link to="/agenda" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                <FiCalendar className="inline mr-2" /> Agenda
              </Link>
              <Link to="/servicos" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                <FiSettings className="inline mr-2" /> Serviços
              </Link>
              <Link to="/relatorios" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                <FiPieChart className="inline mr-2" /> Relatórios
              </Link>
              {userIsAdmin && (
                <>
                  <Link to="/usuarios" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                    <FiUsers className="inline mr-2" /> Usuários
                  </Link>
                </>
              )}
              <Link to="/perfil" className="py-2 hover:text-primary transition" onClick={closeMenu}>
                <FiUser className="inline mr-2" /> Perfil
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 