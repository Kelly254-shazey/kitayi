import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { productsApi } from '../services/api';
import { ShoppingCart, Plus, Minus, ArrowRight, Droplets, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Product = { id: string; name: string; category: string; price: number; image_url: string; volume_liters: number; stock_qty: number; safety_level: number; };
type CartItem = { product: Product; qty: number };

const CATEGORIES = ['All', 'Bottled', 'Dispenser', 'Tanker'];

export default function ShopPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.list();
        const payload = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.results) ? res.data.results : [];
        setProducts(payload);
      } catch { setError('Unable to load product catalog.'); } finally { setLoading(false); }
    };
    loadProducts();
  }, []);

  const filtered = category === 'All' ? products : products.filter(p => p.category === category);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };
  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i).filter(i => i.qty > 0));
  };
  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const subtotal = cart.reduce((acc, i) => acc + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const goToCheckout = () => {
    if (cart.length === 0) return;
    if (!user) { navigate('/login', { state: { from: '/checkout', cart } }); return; }
    navigate('/checkout', { state: { cart } });
  };

  return (
    <div style={{ backgroundColor: 'var(--surface-secondary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="pt-24 pb-12 page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-label mb-2 block" style={{ color: '#2563eb' }}>Online Shop</span>
            <h1 className="text-h1 mb-2">Water Catalog</h1>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Certified bottled water, dispenser refills, and tanker services.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => { setCategory(c); setCurrentPage(1); }}
                className={`btn-sm font-semibold ${category === c ? 'btn-primary' : 'btn-secondary'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Pricing Banner */}
        <div className="mb-8 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#2563eb', color: 'white' }}>%</div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#1e3a8a' }}>Volume &amp; Tier Pricing</p>
              <p className="text-xs" style={{ color: '#3b82f6' }}>Corporate accounts and bulk orders qualify for discounted rates</p>
            </div>
          </div>
          <span className="badge-success">Up to 20% off bulk</span>
        </div>

        {/* Loading / Error */}
        {loading && <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading products...</div>}
        {error && <div className="alert-error mb-6">{error}</div>}

        {!loading && !error && (
          <div className="grid lg:grid-cols-4 gap-8 items-start">
            {/* Product Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProducts.map(product => {
                const cartItem = cart.find(i => i.product.id === product.id);
                return (
                  <div key={product.id} className="card">
                    <div className="h-48 overflow-hidden rounded-t-xl flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Droplets className="w-16 h-16" style={{ color: '#94a3b8' }} />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="badge-neutral">{product.category}</span>
                      </div>
                      {product.stock_qty <= product.safety_level && (
                        <div className="absolute top-3 right-3">
                          <span className="badge-warning">Low Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="card-body flex flex-col gap-4">
                      <div>
                        <h3 className="text-h3 mb-1">{product.name}</h3>
                        <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          {product.volume_liters >= 1000 ? `${product.volume_liters / 1000}kL` : `${product.volume_liters}L`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold" style={{ color: '#2563eb' }}>
                          Ksh {product.price.toLocaleString()}
                        </span>
                      </div>
                      {cartItem ? (
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                          <button onClick={() => updateQty(product.id, -1)} className="btn-secondary btn-sm w-9 h-9 p-0 flex items-center justify-center">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-center text-sm font-semibold">{cartItem.qty} in cart</span>
                          <button onClick={() => updateQty(product.id, 1)} className="btn-primary btn-sm w-9 h-9 p-0 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(product)} className="btn-primary btn-md w-full">
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="col-span-full flex items-center justify-center gap-6 py-6">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary btn-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-caption" style={{ color: 'var(--text-muted)' }}>
                    Page {currentPage} / {totalPages}
                  </span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-secondary btn-sm">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="card" style={{ position: 'sticky', top: '6rem' }}>
              <div className="card-body flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" style={{ color: '#2563eb' }} /> Cart
                  </h3>
                  {cartCount > 0 && <span className="badge-info">{cartCount}</span>}
                </div>

                {!user && (
                  <div className="text-body-sm p-3 rounded-lg" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-secondary)' }}>
                    Sign in to place orders.
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="py-10 text-center flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                    <Droplets className="w-10 h-10" />
                    <p className="text-body-sm">Your cart is empty.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                      {cart.map(({ product, qty }) => (
                        <div key={product.id} className="flex items-start justify-between gap-2 p-3 rounded-lg" style={{ border: '1px solid var(--border)' }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{product.name}</p>
                            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                              &times;{qty} @ Ksh {product.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-bold" style={{ color: '#2563eb' }}>
                              Ksh {(product.price * qty).toLocaleString()}
                            </span>
                            <button onClick={() => removeItem(product.id)} className="btn-ghost btn-sm p-1" style={{ color: 'var(--text-muted)' }}>
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="pt-4 flex flex-col gap-2">
                        <div className="flex justify-between text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span>Subtotal</span>
                          <span>Ksh {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-caption" style={{ color: 'var(--text-muted)' }}>
                          <span>VAT (16%)</span>
                          <span>Ksh {(subtotal * 0.16).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-h3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <span>Total</span>
                          <span>Ksh {(subtotal * 1.16).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={goToCheckout} className="btn-primary btn-lg w-full">
                      {!user ? 'Sign In to Order' : 'Checkout'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
