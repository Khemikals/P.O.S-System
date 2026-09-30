import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = {
    color: '#e5e7eb',
    fontWeight: 500,
    fontSize: 14,
    padding: '6px 10px',
    borderRadius: 6
  };

  return (
    <nav className="navbar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 24px',
      background: '#111827',
      color: 'white',
      boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
    }}>
      <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 700, marginRight: 16 }}>🛒 Mommy's Shop</span>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/pos" style={linkStyle}>POS</Link>
        <Link to="/inventory" style={linkStyle}>Inventory</Link>
        {user.role === 'owner' && (
          <Link to="/reports" style={linkStyle}>Reports</Link>
        )}
      </div>
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 14, color: '#d1d5db' }}>{user.name} · {user.role}</span>
        <button
          onClick={handleLogout}
          style={{ background: '#dc2626', padding: '6px 14px', fontSize: 13 }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}