import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { productsApi } from '../services/api';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Filter, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
      <div className="flex-1 pt-16">

        <section className="py-10 max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="flex flex-col gap-3">
              <div className="section-tag w-fit">Online Shop</div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter">Our Water Catalog</h1>
                <p className="text-ink dark:text-white/80 max-w-lg">Certified bottled water, dispenser refills, and tanker services — order online for fast doorstep delivery.</p>
              </div>
            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-ink-muted" />
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setCurrentPage(1); }}
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
              {paginatedProducts.map(product => {
                const cartItem = cart.find(i => i.product.id === product.id);
                return (
                  <div key={product.id} className="glass-card p-5 flex flex-col gap-5 border-brand-primary/5 hover:border-brand-primary/20 transition-all duration-300 bg-white/60 dark:bg-white/5 shadow-none">
                    <div className="relative overflow-hidden rounded-[1.35rem] h-52 bg-gradient-to-br from-brand-primary/5 to-brand-cyan/5 flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 to-white">
                          <Droplets className="h-16 w-16 text-sky-300" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/90 text-sky-700 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
                          {product.category}
                        </span>
                      </div>
                      {product.stock_qty <= product.safety_level && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold uppercase bg-warning/90 text-white px-2 py-0.5 rounded-full">Low Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-5 flex-1 justify-between">
                      <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                        <div className="min-w-0">
                          <h3 className="font-display font-black text-brand-navy dark:text-white text-2xl leading-tight truncate uppercase tracking-tight">{product.name}</h3>
                          <p className="mt-2 text-sm font-medium text-ink/60 dark:text-white/50">
                            Pure and fresh water
                          </p>
                          <p className="mt-1 text-xs font-semibold text-brand-primary/60 dark:text-white/40">
                            {product.volume_liters >= 1000 ? `${product.volume_liters / 1000}kL` : `${product.volume_liters}L`} capacity
                          </p>
                        </div>
                        <span className="font-display font-black text-2xl text-brand-primary dark:text-white whitespace-nowrap">
                          Ksh {product.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-auto">
                        {cartItem ? (
                          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                            <button aria-label="Decrease quantity" onClick={() => updateQty(product.id, -1)} className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary hover:bg-brand-primary/20 transition-colors">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-center text-sm font-black text-brand-navy dark:text-white">{cartItem.qty} in cart</span>
                            <button aria-label="Increase quantity" onClick={() => updateQty(product.id, 1)} className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white hover:bg-brand-navy transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            aria-label={`Add ${product.name} to cart`}
                            onClick={() => addToCart(product)}
                            className="btn-premium w-full py-4 text-center text-base"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="col-span-full flex items-center justify-center gap-6 mt-12 py-6 border-t border-brand-primary/5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Previous page"
                    className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-brand-primary dark:text-white hover:bg-brand-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-navy dark:text-white/60">
                    Page {currentPage} <span className="mx-2 text-brand-primary/30">/</span> {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    title="Next page"
                    className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-brand-primary dark:text-white hover:bg-brand-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="glass-card p-6 flex flex-col gap-5 sticky top-24 bg-brand-navy dark:bg-white/5 border-none text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-brand-cyan" /> Cart
                </h3>
                {cartCount > 0 && (
                  <span className="text-xs bg-brand-cyan text-brand-navy px-2 py-0.5 rounded-full font-black">{cartCount}</span>
                )}
              </div>

              {!user && (
                <div className="p-3 bg-white/10 border border-white/20 rounded text-xs text-white/80">
                  Sign in to your account to place orders
                </div>
              )}

              {cart.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-3">
                  <Droplets className="w-10 h-10 text-white/20" />
                  <p className="text-sm text-white/50">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
                    {cart.map(({ product, qty }) => (
                      <div key={product.id} className="flex items-start justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <p className="text-xs font-black text-white truncate uppercase tracking-tight">{product.name}</p>
                          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">×{qty} @ Ksh {product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-brand-cyan">Ksh {(product.price * qty).toLocaleString()}</span>
                          <button
                            onClick={() => removeItem(product.id)}
                            title="Remove item"
                            aria-label="Remove item"
                            className="text-white/30 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-white/60 font-bold uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>Ksh {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/40 font-bold uppercase tracking-widest">
                      <span>VAT (16%)</span>
                      <span>Ksh {(subtotal * 0.16).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-lg font-display font-black text-white border-t border-white/10 pt-4 mt-2 uppercase tracking-tighter">
                      <span>Total</span>
                      <span>Ksh {(subtotal * 1.16).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button onClick={goToCheckout} className="btn-premium w-full py-4 text-center">
                    {!user ? 'Sign In to Order' : 'Checkout Now'} <ArrowRight className="w-4 h-4" />
                  </button>
                  {!user && cart.length > 0 && (
                    <p className="text-[10px] text-white/40 text-center mt-2 font-bold uppercase tracking-widest">Login required to order</p>
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
