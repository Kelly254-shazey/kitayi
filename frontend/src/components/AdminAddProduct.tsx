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
    <div className="max-w-2xl mx-auto p-6 glass-card mt-10">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <PackagePlus className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-white">Add New Product</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-400/20 text-red-300 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>Product added successfully to the catalog!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="product_name" className="text-sm font-semibold text-white/70">Product Name</label>
            <input
              id="product_name"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="glass-input"
              placeholder="e.g. Kitayi Pure 500ml"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="sku" className="text-sm font-semibold text-white/70">SKU</label>
            <input
              id="sku"
              required
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="glass-input"
              placeholder="Unique SKU"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="category" className="text-sm font-semibold text-white/70">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="glass-input"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="volume_liters" className="text-sm font-semibold text-white/70">Volume (Liters)</label>
            <input id="volume_liters" required type="number" step="0.01" name="volume_liters" value={formData.volume_liters} onChange={handleChange} className="glass-input" />
          </div>
          <div className="space-y-1">
            <label htmlFor="stock_qty" className="text-sm font-semibold text-white/70">Stock Qty</label>
            <input id="stock_qty" required type="number" name="stock_qty" value={formData.stock_qty} onChange={handleChange} className="glass-input" />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="price" className="text-sm font-semibold text-white/70">Price (KES)</label>
          <input id="price" required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="glass-input" placeholder="0.00" />
        </div>

        <div className="space-y-1">
          <label htmlFor="image_url" className="text-sm font-semibold text-white/70">Image URL</label>
          <input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} className="glass-input" placeholder="https://..." />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Processing...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
};

export default AdminAddProduct;