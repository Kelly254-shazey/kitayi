import React, { useState } from 'react';
import { api } from '../services/api';
import { PackagePlus, Save, AlertCircle, Check } from 'lucide-react';

const AdminAddProduct: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Bottled' as 'Bottled' | 'Dispenser' | 'Tanker',
    volume_liters: '',
    price: '',
    stock_qty: '',
    description: '',
    image_url: ''
  });

  const categories = ['Bottled', 'Dispenser', 'Tanker'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Convert numeric fields to match Product interface expectations
    const payload = {
      ...formData,
      volume_liters: parseFloat(formData.volume_liters) || 0,
      stock_qty: parseInt(formData.stock_qty) || 0,
    };

    try {
      await api.post('/products/', payload);
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        sku: '',
        category: 'Bottled',
        volume_liters: '',
        price: '',
        stock_qty: '',
        description: '',
        image_url: ''
      });
    } catch (err: unknown) {
      console.error('Error adding product:', err);
      const axiosError = err as { response?: { data?: { message?: string; detail?: string } } };
      setError(axiosError.response?.data?.message || axiosError.response?.data?.detail || 'Failed to add product. Ensure you have administrative permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto card mt-10">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <PackagePlus className="w-6 h-6" style={{ color: '#2563eb' }} />
          <h2 className="text-h2" style={{ color: 'var(--text-primary)' }}>Add New Product</h2>
        </div>

        {error && <div className="alert-error"><AlertCircle className="w-4 h-4" /> {error}</div>}
        {success && <div className="alert-success"><Check className="w-4 h-4" /> Product added successfully to the catalog!</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product_name" className="label">Product Name</label>
              <input id="product_name" required name="name" value={formData.name} onChange={handleChange} className="input" placeholder="e.g. Kitayi Pure 500ml" />
            </div>
            <div>
              <label htmlFor="sku" className="label">SKU</label>
              <input id="sku" required name="sku" value={formData.sku} onChange={handleChange} className="input" placeholder="Unique SKU" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} className="select">
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="volume_liters" className="label">Volume (Liters)</label>
              <input id="volume_liters" required type="number" step="0.01" name="volume_liters" value={formData.volume_liters} onChange={handleChange} className="input" />
            </div>
            <div>
              <label htmlFor="stock_qty" className="label">Stock Qty</label>
              <input id="stock_qty" required type="number" name="stock_qty" value={formData.stock_qty} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="label">Price (KES)</label>
            <input id="price" required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="input" placeholder="0.00" />
          </div>

          <div>
            <label htmlFor="image_url" className="label">Image URL</label>
            <input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} className="input" placeholder="https://..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            <Save className="w-4 h-4" /> {loading ? 'Processing...' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;