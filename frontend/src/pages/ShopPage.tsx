import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { productsApi } from '../services/api';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Filter, Droplets } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  volume_liters: number;
  stock_qty: number;
  safety_level: number;
};

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

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await productsApi.list();
        const payload = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
          ? res.data.results
          : [];
        setProducts(payload);
      } catch (error) {
        console.error('Product load failed:', error);
        setError('Unable to load product catalog. Please refresh or try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const subtotal = cart.reduce((acc, i) => acc + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const goToCheckout = () => {
    if (cart.length === 0) return;
    if (!user) {
      navigate('/login', { state: { from: '/checkout', cart } });
      return;
    }
    navigate('/checkout', { state: { cart } });
  };

  return (
    <div className="page-shell">
      <Navbar />
      <div className="pt-24">

        <section className="py-16 max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex flex-col gap-3">
              <div className="section-tag w-fit">Online Shop</div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-ink">Purified Water Catalog</h1>
                <p className="text-ink-secondary max-w-lg">KEBS-certified bottled water, dispenser refills, and bulk tanker services — order online for fast doorstep delivery.</p>
              </div>
            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-ink-muted" />
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    category === c
                      ? 'bg-cyan-500 text-white border-cyan-400'
                      : 'border-ink/15 text-ink-secondary hover:border-ink/35 hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="lg:col-span-4 p-8 text-center text-ink-secondary">Loading products…</div>
          )}
          {error && (
            <div className="lg:col-span-4 p-8 text-center text-danger">{error}</div>
          )}
          <div className="grid lg:grid-cols-4 gap-8 items-start">
            {/* Product Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(product => {
                const cartItem = cart.find(i => i.product.id === product.id);
                return (
                  <div key={product.id} className="glass-card overflow-hidden flex flex-col group hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-cyan-500/90 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                          {product.category}
                        </span>
                      </div>
                      {product.stock_qty <= product.safety_level && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold uppercase bg-warning/90 text-white px-2 py-0.5 rounded-full">Low Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-display font-bold text-white text-sm leading-tight">{product.name}</h3>
                        <p className="text-xs text-white/45">Volume: {product.volume_liters >= 1000 ? `${product.volume_liters / 1000}kL` : `${product.volume_liters}L`}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-lg text-sky-100">
                          Ksh {product.price.toLocaleString()}
                        </span>
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button aria-label="Decrease quantity" onClick={() => updateQty(product.id, -1)} className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold text-slate-100 w-5 text-center">{cartItem.qty}</span>
                            <button aria-label="Increase quantity" onClick={() => updateQty(product.id, 1)} className="w-7 h-7 rounded-lg bg-sky-500/80 border border-sky-400/50 flex items-center justify-center text-white hover:bg-sky-500 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            aria-label={`Add ${product.name} to cart`}
                            onClick={() => addToCart(product)}
                            className="flex items-center gap-1.5 bg-sky-500/15 border border-sky-400/25 text-sky-300 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Sidebar */}
            <div className="glass-card p-6 flex flex-col gap-5 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-cyan-300" /> Cart
                </h3>
                {cartCount > 0 && (
                  <span className="text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full font-bold">{cartCount}</span>
                )}
              </div>

              {!user && (
                <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded text-xs text-blue-100">
                  Sign in to your account to place orders
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-3">
                  <Droplets className="w-10 h-10 text-white/15" />
                  <p className="text-sm text-white/35">Your cart is empty.</p>
                  <p className="text-xs text-white/25">Add products from the catalog.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                    {cart.map(({ product, qty }) => (
                      <div key={product.id} className="flex items-start justify-between gap-2 p-3 rounded-xl bg-slate-100/10 border border-slate-200/15">
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                          <p className="text-[10px] text-slate-200/80">×{qty} @ Ksh {product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-white">Ksh {(product.price * qty).toLocaleString()}</span>
                          <button
                            onClick={() => removeItem(product.id)}
                            title="Remove item"
                            aria-label="Remove item"
                            className="text-white/30 hover:text-danger transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200/15 pt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-slate-200/80">
                      <span>Subtotal (excl. VAT)</span>
                      <span>Ksh {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/50">
                      <span>VAT (16%)</span>
                      <span>Ksh {(subtotal * 0.16).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm font-display font-black text-white border-t border-white/10 pt-2 mt-1">
                      <span>Total</span>
                      <span>Ksh {(subtotal * 1.16).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button onClick={goToCheckout} className="btn-primary w-full py-3.5">
                    {!user ? 'Sign In to Checkout' : 'Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
                  </button>
                  {!user && cart.length > 0 && (
                    <p className="text-xs text-white/60 text-center mt-2">You must be logged in to place an order</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
