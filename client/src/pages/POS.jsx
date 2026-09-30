import { useState, useEffect } from 'react';
import api from '../utils/api';
import Receipt from '../components/Receipt';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setMessage('Failed to load products');
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product._id);
    if (existing) {
      setCart(cart.map((item) =>
        item.productId === product._id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        price: product.sellingPrice,
        qty: 1,
        maxStock: product.stockQty
      }]);
    }
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    setCart(cart.map((item) =>
      item.productId === productId ? { ...item, qty } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/sales', {
        items: cart.map((item) => ({ productId: item.productId, qty: item.qty })),
        paymentMethod
      });
      setCompletedSale(res.data);
      setCart([]);
      fetchProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    setMessage('');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (completedSale) {
    return (
      <div className="page" style={{ padding: 30, background: '#f5f6fa', minHeight: '100vh' }}>
        <Receipt sale={completedSale} />
        <div style={{ textAlign: 'center', marginTop: 20 }} className="no-print">
          <button onClick={handlePrint} style={{ padding: '10px 24px', marginRight: 10 }}>
            🖨 Print Receipt
          </button>
          <button
            onClick={handleNewSale}
            style={{ padding: '10px 24px', background: '#059669' }}
          >
            + New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page pos-layout" style={{ padding: 24, display: 'flex', gap: 24, background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={{ flex: 2 }}>
        <h2>Point of Sale</h2>
        <input
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 16 }}
        />
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              onClick={() => p.stockQty > 0 && addToCart(p)}
              style={{
                background: 'white',
                borderRadius: 10,
                padding: 14,
                cursor: p.stockQty > 0 ? 'pointer' : 'not-allowed',
                opacity: p.stockQty > 0 ? 1 : 0.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'transform 0.1s ease'
              }}
            >
              <strong>{p.name}</strong>
              <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 13 }}>
                ₵{p.sellingPrice} · Stock: {p.stockQty}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1,
        background: 'white',
        borderRadius: 10,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        alignSelf: 'flex-start'
      }}>
        <h3 style={{ marginTop: 0 }}>🛒 Cart</h3>
        {cart.length === 0 && <p style={{ color: '#9ca3af' }}>No items yet</p>}
        {cart.map((item) => (
          <div key={item.productId} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f2f7' }}>
            <div style={{ fontWeight: 500 }}>{item.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input
                type="number"
                min="1"
                max={item.maxStock}
                value={item.qty}
                onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                style={{ width: 55, padding: 6 }}
              />
              <span style={{ fontSize: 14, color: '#374151' }}>
                x ₵{item.price} = <strong>₵{item.qty * item.price}</strong>
              </span>
              <button
                onClick={() => removeFromCart(item.productId)}
                style={{ background: '#ef4444', padding: '4px 10px', marginLeft: 'auto' }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {cart.length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total</span><span>₵{total}</span>
            </h3>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: 10, marginBottom: 12 }}
            >
              <option value="cash">💵 Cash</option>
              <option value="momo">📱 Mobile Money</option>
            </select>
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ width: '100%', padding: 12, fontSize: 15, background: '#059669' }}
            >
              {loading ? 'Processing...' : 'Checkout'}
            </button>
          </>
        )}

        {message && <p style={{ marginTop: 10, color: '#dc2626' }}>{message}</p>}
      </div>
    </div>
  );
}