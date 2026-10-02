import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.get('/products');
        setProducts(productsRes.data);

        if (user.role === 'owner') {
          const salesRes = await api.get('/sales');
          setSales(salesRes.data);
        }
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [user.role]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error) return <p style={{ padding: 24, color: '#dc2626' }}>{error}</p>;

  const now = new Date();
  const todaySales = sales.filter((s) => isSameDay(new Date(s.createdAt), now));
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const lowStockItems = products.filter((p) => p.stockQty <= p.reorderLevel);

  const statCard = (label, value, accent) => (
    <div style={{
      background: 'white',
      borderRadius: 10,
      padding: '18px 22px',
      minWidth: 170,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderTop: `3px solid ${accent}`
    }}>
      <p style={{ margin: 0, fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 700 }}>{value}</p>
    </div>
  );

  return (
    <div className="page" style={{ padding: 24, background: '#f5f6fa', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: 2 }}>Welcome, {user.name} 👋</h2>
      <p style={{ color: '#6b7280', marginTop: 0 }}>{user.role === 'owner' ? 'Shop Owner' : 'Cashier'}</p>

      <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
        {user.role === 'owner' && (
          <>
            {statCard("Today's Sales", `${todaySales.length} txns`, '#2563eb')}
            {statCard("Today's Revenue", `₵${todayTotal}`, '#059669')}
            {statCard('Total Products', products.length, '#7c3aed')}
          </>
        )}
        {statCard('Low Stock Items', lowStockItems.length, lowStockItems.length > 0 ? '#dc2626' : '#9ca3af')}
      </div>

      {lowStockItems.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3>⚠️ Low Stock Alerts</h3>
          <table cellPadding="10" style={{ width: '100%', maxWidth: 500, borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>Product</th><th>Stock Left</th><th>Reorder Level</th></tr>
            </thead>
            <tbody>
              {lowStockItems.map((p) => (
                <tr key={p._id} style={{ background: '#fef2f2' }}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: '#dc2626', fontWeight: 600 }}>{p.stockQty}</td>
                  <td>{p.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 30, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/pos">
          <button style={{ padding: '10px 20px' }}>🛒 Go to POS</button>
        </Link>
        <Link to="/inventory">
          <button style={{ padding: '10px 20px', background: '#7c3aed' }}>📦 Manage Inventory</button>
        </Link>
        {user.role === 'owner' && (
          <Link to="/reports">
            <button style={{ padding: '10px 20px', background: '#059669' }}>📊 View Reports</button>
          </Link>
        )}
      </div>
    </div>
  );
}