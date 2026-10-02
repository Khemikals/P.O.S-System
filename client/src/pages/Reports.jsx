import { useState, useEffect } from 'react';
import api from '../utils/api';

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isSameWeek(d1, d2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfWeek = (d) => {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  return Math.abs(startOfWeek(d1) - startOfWeek(d2)) < oneDay;
}

function isSameMonth(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get('/sales');
        setSales(res.data);
      } catch {
        setError('Failed to load sales');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (error) return <p style={{ padding: 24, color: '#dc2626' }}>{error}</p>;

  const now = new Date();
  const daily = sales.filter((s) => isSameDay(new Date(s.createdAt), now));
  const weekly = sales.filter((s) => isSameWeek(new Date(s.createdAt), now));
  const monthly = sales.filter((s) => isSameMonth(new Date(s.createdAt), now));

  const sumTotal = (list) => list.reduce((sum, s) => sum + s.total, 0);

  const productTotals = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productTotals[item.name]) {
        productTotals[item.name] = { qty: 0, revenue: 0 };
      }
      productTotals[item.name].qty += item.qty;
      productTotals[item.name].revenue += item.qty * item.priceAtSale;
    });
  });

  const bestSellers = Object.entries(productTotals)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  const statCard = (label, count, revenue, accent) => (
    <div style={{
      background: 'white',
      borderRadius: 10,
      padding: '18px 22px',
      minWidth: 160,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderTop: `3px solid ${accent}`
    }}>
      <p style={{ margin: 0, fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>{count} sales</p>
      <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700 }}>₵{revenue}</p>
    </div>
  );

  return (
    <div className="page" style={{ padding: 24, background: '#f5f6fa', minHeight: '100vh' }}>
      <h2>Reports</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 30, flexWrap: 'wrap' }}>
        {statCard('Today', daily.length, sumTotal(daily), '#2563eb')}
        {statCard('This Week', weekly.length, sumTotal(weekly), '#7c3aed')}
        {statCard('This Month', monthly.length, sumTotal(monthly), '#059669')}
        {statCard('All Time', sales.length, sumTotal(sales), '#111827')}
      </div>

      <h3>🏆 Best Sellers</h3>
      <table cellPadding="10" style={{ width: '100%', maxWidth: 500, borderCollapse: 'collapse', marginBottom: 30 }}>
        <thead>
          <tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr>
        </thead>
        <tbody>
          {bestSellers.map(([name, data]) => (
            <tr key={name}>
              <td style={{ fontWeight: 500 }}>{name}</td>
              <td>{data.qty}</td>
              <td>₵{data.revenue}</td>
            </tr>
          ))}
          {bestSellers.length === 0 && (
            <tr><td colSpan="3" style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No sales yet</td></tr>
          )}
        </tbody>
      </table>

      <h3>🧾 Recent Sales</h3>
      <table cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Date</th><th>Cashier</th><th>Items</th><th>Total</th><th>Payment</th></tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s._id}>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td>{s.cashier?.name || 'Unknown'}</td>
              <td>{s.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</td>
              <td style={{ fontWeight: 600 }}>₵{s.total}</td>
              <td>{s.paymentMethod === 'momo' ? '📱 Momo' : '💵 Cash'}</td>
            </tr>
          ))}
          {sales.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No sales recorded</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}