import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, Zap,
  Check, CreditCard, Smartphone, Wallet
} from 'lucide-react';

interface CartItem {
  id: string;
  product: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface CartSummary {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  estimated_tax: string;
  estimated_total: string;
}

interface Address {
  id: string;
  address_type: string;
  street: string;
  city: string;
}

interface SavedPaymentMethod {
  id: string;
  display_name: string;
  provider: string;
}

const ShoppingCartCheckout: React.FC = () => {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'delivery' | 'payment' | 'confirmation'>('cart');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [deliverySlot, setDeliverySlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [processing, setProcessing] = useState(false);

  // Fetch cart, addresses, and payment methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch cart
        const cartRes = await api.get('/orders/cart/');
        setCart(cartRes.data);

        // Fetch addresses
        const addrRes = await api.get('/addresses/');
        const addressList = Array.isArray(addrRes.data) ? addrRes.data : addrRes.data.results || [];
        setAddresses(addressList);
        if (addressList.length > 0) setSelectedAddress(addressList[0].id);

        // Fetch saved payment methods
        const payRes = await api.get('/payment-methods/');
        const methodList = Array.isArray(payRes.data) ? payRes.data : payRes.data.results || [];
        setSavedPaymentMethods(methodList);
        if (methodList.length > 0) setPaymentMethod(methodList[0].id);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      await api.patch('/orders/cart/update_item/', {
        item_id: itemId,
        quantity,
      });

      // Refresh cart
      const cartRes = await api.get('/orders/cart/');
      setCart(cartRes.data);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await api.delete(`/orders/cart/remove_item/?item_id=${itemId}`);
      
      // Refresh cart
      const cartRes = await api.get('/orders/cart/');
      setCart(cartRes.data);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleApplyCoupon = async () => {
    // TODO: Implement coupon validation API
    console.log('Apply coupon:', couponCode);
  };

  const handleCheckout = async () => {
    if (!selectedAddress || !deliveryDate || !paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      // Create order
      await api.post('/orders/', {
        delivery_address: selectedAddress,
        delivery_date: deliveryDate,
        delivery_slot: deliverySlot,
        payment_method_id: paymentMethod,
        coupon_code: couponCode || null,
      });

      // Clear cart
      await api.post('/orders/cart/clear/');
      
      setCheckoutStep('confirmation');
      setCart(null);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center overflow-y-auto">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Cart Step
  if (checkoutStep === 'cart') {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-6">Start shopping to add items to your cart</p>
            <button
              onClick={() => window.location.href = '#shop'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              aria-label="Continue shopping for more products"
            >
              Continue Shopping <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-4 flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.product_name}</h3>
                      <p className="text-slate-600 text-sm">Price: KES {parseFloat(item.unit_price).toFixed(2)} each</p>
                      
                      {/* Quantity Control */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 rounded transition-colors"
                        aria-label="Decrease item quantity"
                        title="Decrease quantity"
                      >
                        <Minus className="w-5 h-5 text-slate-600" />
                      </button>
                        <span className="w-8 text-center font-semibold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 rounded transition-colors"
                          aria-label="Increase item quantity"
                          title="Increase quantity"
                        >
                          <Plus className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">KES {parseFloat(item.total_price).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{item.quantity} × {parseFloat(item.unit_price).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                        aria-label="Remove item from cart"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4">
                <label htmlFor="coupon-input" className="block text-sm font-semibold text-slate-900 mb-2">Have a coupon code?</label>
                <div className="flex gap-2">
                  <input
                    id="coupon-input"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Coupon code input"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-colors"
                    aria-label="Apply coupon code"
                  >
                    Apply
                  </button>
                </div>
              </div>


            </div>
            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>

                <div className="space-y-3 border-b border-slate-200 pb-4 mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>KES {parseFloat(cart.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (16%)</span>
                    <span>KES {parseFloat(cart.estimated_tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span>KES 200</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-slate-900 mb-6">
                  <span>Total</span>
                  <span>KES {(parseFloat(cart.estimated_total) + 200).toFixed(2)}</span>
                </div>

                <button
                  onClick={() => setCheckoutStep('delivery')}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
                  aria-label="Proceed to checkout"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => window.location.href = '#shop'}
                  className="w-full mt-3 px-4 py-3 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
                  aria-label="Continue shopping for more products"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Delivery Step
  if (checkoutStep === 'delivery') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Delivery Details</h1>
          <p className="text-slate-600">Choose where and when to receive your order</p>
        </div>

        <div className="space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Select Delivery Address</h2>
            <div className="space-y-2">
              {addresses.map(addr => (
                <label key={addr.id} className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-200 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                    aria-label={`Select ${addr.address_type} address`}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{addr.address_type}</p>
                    <p className="text-sm text-slate-600">{addr.street}, {addr.city}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Date & Slot */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Choose Delivery Date & Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="delivery-date" className="block text-sm font-semibold text-slate-900 mb-2">Delivery Date</label>
                <input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select delivery date"
                />
              </div>
              <div>
                <label htmlFor="delivery-slot" className="block text-sm font-semibold text-slate-900 mb-2">Time Slot</label>
                <select
                  id="delivery-slot"
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value as 'Morning' | 'Afternoon' | 'Evening')}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select delivery time slot"
                >
                  <option value="Morning">Morning (8 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={() => setCheckoutStep('cart')}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Go back to shopping cart"
            >
              Back to Cart
            </button>
            <button
              onClick={() => setCheckoutStep('payment')}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
              aria-label="Continue to payment method selection"
            >
              Continue to Payment <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  if (checkoutStep === 'payment') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Method</h1>
          <p className="text-slate-600">Choose how you'd like to pay</p>
        </div>

        <div className="space-y-6">
          {/* Saved Payment Methods */}
          {savedPaymentMethods.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Saved Payment Methods</h2>
              <div className="space-y-2">
                {savedPaymentMethods.map(method => (
                  <label key={method.id} className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-200 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                      aria-label={`Select ${method.display_name} payment method`}
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{method.display_name}</p>
                      <p className="text-sm text-slate-600">{method.provider}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Other Payment Options */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Other Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'M-Pesa', icon: Smartphone },
                { name: 'Credit/Debit Card', icon: CreditCard },
                { name: 'Digital Wallet', icon: Wallet },
              ].map(method => (
                <button
                  key={method.name}
                  onClick={() => setPaymentMethod(method.name)}
                  className={`p-4 border-2 rounded-lg flex items-center gap-2 font-semibold transition-all ${
                    paymentMethod === method.name ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  aria-label={`Select ${method.name} payment method`}
                >
                  <method.icon className="w-5 h-5" />
                  <span>{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={() => setCheckoutStep('delivery')}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Go back to delivery details"
            >
              Back
            </button>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
              aria-label="Complete purchase and submit order"
            >
              {processing ? 'Processing...' : 'Complete Purchase'}
              {!processing && <Zap className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Step
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-emerald-200 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 mb-6">Your order has been successfully placed. You'll receive a confirmation email shortly.</p>
        <button
          onClick={() => window.location.href = '#orders'}
          className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all"
          aria-label="View your orders"
        >
          View My Orders <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ShoppingCartCheckout;
