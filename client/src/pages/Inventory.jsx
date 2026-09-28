import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', category: '', unit: 'piece',
    costPrice: '', sellingPrice: '', stockQty: '', reorderLevel: 5
  });
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
      setForm({ name: '', category: '', unit: 'piece', costPrice: '', sellingPrice: '', stockQty: '', reorderLevel: 5 });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQty: product.stockQty,
      reorderLevel: product.reorderLevel
    });
    setEditingId(product._id);
  };

  const handleCancelEdit = () => {
    setForm({ name: '', category: '', unit: 'piece', costPrice: '', sellingPrice: '', stockQty: '', reorderLevel: 5 });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ padding: 24, background: '#f5f6fa', minHeight: '100vh' }}>
      <h2>Inventory</h2>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <div style={{
        background: 'white',
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        maxWidth: 420
      }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? '✏️ Edit Product' : '+ Add Product'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
          <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
          <select name="unit" value={form.unit} onChange={handleChange}>
            <option value="piece">Piece</option>
            <option value="pack">Pack</option>
            <option value="carton">Carton</option>
            <option value="kg">Kg</option>
            <option value="bag">Bag</option>
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <input name="costPrice" type="number" placeholder="Cost price" value={form.costPrice} onChange={handleChange} required style={{ flex: 1 }} />
            <input name="sellingPrice" type="number" placeholder="Selling price" value={form.sellingPrice} onChange={handleChange} required style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input name="stockQty" type="number" placeholder="Stock quantity" value={form.stockQty} onChange={handleChange} required style={{ flex: 1 }} />
            <input name="reorderLevel" type="number" placeholder="Reorder level" value={form.reorderLevel} onChange={handleChange} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={{ flex: 1 }}>
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ background: '#9ca3af' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <table cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th><th>Category</th><th>Unit</th><th>Cost</th><th>Price</th><th>Stock</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p._id}
              style={{ background: p.stockQty <= p.reorderLevel ? '#fef2f2' : 'white' }}
            >
              <td style={{ fontWeight: 500 }}>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.unit}</td>
              <td>₵{p.costPrice}</td>
              <td>₵{p.sellingPrice}</td>
              <td style={{ color: p.stockQty <= p.reorderLevel ? '#dc2626' : 'inherit', fontWeight: p.stockQty <= p.reorderLevel ? 600 : 'normal' }}>
                {p.stockQty} {p.stockQty <= p.reorderLevel && '⚠️'}
              </td>
              <td>
                <button onClick={() => handleEdit(p)} style={{ padding: '6px 12px', fontSize: 13, marginRight: 6 }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 12px', fontSize: 13, background: '#ef4444' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No products yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}