import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Reports from './pages/Reports';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/inventory"
          element={user ? <Inventory /> : <Navigate to="/login" />}
        />
        <Route
          path="/pos"
          element={user ? <POS /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={user?.role === 'owner' ? <Reports /> : <Navigate to="/dashboard" />}
        />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </>
  );
}

export default App;