import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';

// Componentes
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Página "Em Construção"
const UnderConstruction = ({ title }: { title: string }) => (
  <div className="text-center py-10">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
      <p className="text-yellow-500 text-6xl mb-4">🚧</p>
      <p className="text-gray-400 mb-2">Página em construção</p>
      <p className="text-gray-500 text-sm">
        Esta funcionalidade estará disponível em breve.
      </p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública - Login */}
        <Route 
          path="/" 
          element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />} 
        />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/atendimentos" element={<UnderConstruction title="Atendimentos" />} />
          <Route path="/atendimentos/novo" element={<UnderConstruction title="Novo Atendimento" />} />
          <Route path="/agenda" element={<UnderConstruction title="Agenda" />} />
        </Route>

        {/* Rotas protegidas que requerem admin */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/servicos" element={<UnderConstruction title="Serviços" />} />
          <Route path="/usuarios" element={<UnderConstruction title="Usuários" />} />
        </Route>

        {/* Rota não encontrada */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
