import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import {
  ShoppingCart, Filter, AlertCircle,
  Droplets, Package, Zap, Check, Plus, Minus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'Bottled' | 'Dispenser' | 'Tanker';
  volume_liters: number;
  price: string;
  stock_qty: number;
  image_url?: string;
  description?: string;
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showCartAddition, setShowCartAddition] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Compute filtered and sorted products without setState in effect
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        filtered.reverse();
        break;
      case 'volume':
        filtered.sort((a, b) => b.volume_liters - a.volume_liters);
        break;
    }

    return filtered;
  }, [selectedCategory, sortBy, products]);

  const categories = ['Bottled', 'Dispenser', 'Tanker'];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products/');
        const productList = Array.isArray(response.data) ? response.data : response.data.results || [];
        setProducts(productList);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);



  const handleAddToCart = async (product: Product, quantity: number) => {
    if (quantity < 1) return;

    try {
      await api.post('/orders/cart/add_item/', {
        product_id: product.id,
        quantity,
      });

      setShowCartAddition(product.id);
      setTimeout(() => setShowCartAddition(null), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const toggleQuantity = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Bottled':
        return <Droplets className="w-5 h-5" />;
      case 'Dispenser':
        return <Package className="w-5 h-5" />;
      case 'Tanker':
        return <Zap className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    const colors: Record<string, string> = {
      'Bottled': 'bg-blue-100 text-blue-700',
      'Dispenser': 'bg-emerald-100 text-emerald-700',
      'Tanker': 'bg-amber-100 text-amber-700',
    };

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${colors[category] || 'bg-slate-100'}`}>
        {getCategoryIcon(category)}
        <span>{category}</span>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Kitayi Water Catalog</h1>
        <p className="text-slate-600">Premium water products with dynamic pricing for your needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-slate-600" />
              <h2 className="font-bold text-slate-900">Filters</h2>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedCategory === cat ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort-select" className="font-semibold text-slate-900 text-sm mb-3 block">Sort By</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sort products by"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="volume">Volume: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center">
                        {getCategoryIcon(product.category)}
                        <p className="text-sm text-slate-500 mt-2">{product.category}</p>
                      </div>
                    )}
                    {product.stock_qty > 0 && product.stock_qty < 10 && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                        Low Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <CategoryBadge category={product.category} />
                    <h3 className="font-bold text-slate-900 mt-2 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">SKU: {product.sku}</p>

                    {/* Specs */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>{product.volume_liters}L capacity</span>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-slate-900">
                        KES {parseFloat(product.price).toFixed(2)}
                      </div>
                      <div className={`text-sm mt-1 ${
                        product.stock_qty > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of stock'}
                      </div>
                    </div>

                    {/* Quantity Selector & Add to Cart */}
                    {product.stock_qty > 0 && (
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-lg p-1 w-fit">
                          <button
                            onClick={() => toggleQuantity(product.id, -1)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                          <span className="w-6 text-center font-semibold text-slate-900">
                            {quantities[product.id] || 1}
                          </span>
                        <button
                          onClick={() => toggleQuantity(product.id, 1)}
                          className="p-1 hover:bg-white rounded transition-colors"
                          aria-label="Increase quantity"
                          title="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product, quantities[product.id] || 1)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all"                        aria-label={`Add ${product.name} to cart`}                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>Add to Cart</span>
                          {showCartAddition === product.id && (
                            <Check className="w-5 h-5 animate-pulse" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
