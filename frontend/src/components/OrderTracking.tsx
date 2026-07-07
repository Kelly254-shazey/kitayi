import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  Package, Truck, CheckCircle2, Phone,
  RotateCw, Calendar
} from 'lucide-react';

interface OrderItem {
  product_name: string;
  quantity: number;
  total_price: string;
}

interface Order {
  id: string;
  tracking_number: string;
  status: string;
  delivery_status: string;
  delivery_date: string;
  delivery_slot: string;
  estimated_delivery: string;
  payment_status: string;
  items: OrderItem[];
  total_amount: string;
  driver_phone?: string;
  vehicle?: string;
  route?: Array<{ latitude: string; longitude: string; timestamp: string }>;
  created_at: string;
}

const OrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const statusSteps = ['Pending', 'Assigned', 'Dispatched', 'In Transit', 'Delivered'];
  const deliveryStatusColors: Record<string, string> = {
    'Pending': 'bg-gray-100 text-gray-700',
    'Assigned': 'bg-blue-100 text-blue-700',
    'Dispatched': 'bg-purple-100 text-purple-700',
    'In Transit': 'bg-yellow-100 text-yellow-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Failed': 'bg-red-100 text-red-700',
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/');
      const orderList = Array.isArray(response.data) ? response.data : response.data.results || [];

      orderList.sort((a: Order, b: Order) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(orderList);
      setSelectedOrder(prev => prev ?? (orderList.length > 0 ? orderList[0] : null));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await fetchOrders();
    };

    run();

    const interval = setInterval(() => {
      if (!mounted) return;
      fetchOrders();
    }, 30000); // Refresh every 30s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchOrders]);


  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await api.get(`/orders/${selectedOrder?.id}/tracking_details/`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Failed to refresh tracking:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return Math.max(0, statusSteps.indexOf(status));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center overflow-y-auto">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Order Tracking</h1>
        <p className="text-slate-600">Track your orders in real-time</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No orders yet</h2>
          <p className="text-slate-600">Start shopping to place your first order</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="font-bold text-slate-900">Your Orders</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {orders.map(order => (
                <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm">{order.tracking_number}</p>
                    <p className="text-xs text-slate-600 mt-1">{formatDate(order.created_at)}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        deliveryStatusColors[order.delivery_status] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.delivery_status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tracking Details */}
          {selectedOrder && (
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedOrder.tracking_number}</h2>
                      <p className="text-slate-600 text-sm mt-1">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label="Refresh tracking details"
                      title="Refresh"
                    >
                      <RotateCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">{selectedOrder.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Delivery Status</p>
                      <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded ${
                        deliveryStatusColors[selectedOrder.delivery_status] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedOrder.delivery_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-6">Delivery Progress</h3>
                  
                  <div className="space-y-4">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = getStatusIndex(selectedOrder.status) >= idx;
                      const isCurrent = step === selectedOrder.status;

                      return (
                        <div key={step} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isCompleted && <CheckCircle2 size={20} />}
                              {!isCompleted && (idx + 1)}
                            </div>
                            {idx < statusSteps.length - 1 && (
                              <div className={`w-1 h-12 mt-2 ${
                                isCompleted ? 'bg-green-500' : 'bg-slate-200'
                              }`} />
                            )}
                          </div>
                          <div className={`pt-1 ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                            <p className="font-semibold">{step}</p>
                            {isCurrent && <p className="text-sm text-blue-600">Current status</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Info */}
                {selectedOrder.delivery_status !== 'Pending' && (
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Delivery Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar size={20} className="text-slate-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-600">Delivery Date</p>
                          <p className="font-semibold text-slate-900">{formatDate(selectedOrder.delivery_date)}</p>
                          <p className="text-sm text-slate-600">{selectedOrder.delivery_slot}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Truck size={20} className="text-slate-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-600">Vehicle</p>
                          <p className="font-semibold text-slate-900">{selectedOrder.vehicle || 'Not assigned'}</p>
                        </div>
                      </div>

                      {selectedOrder.driver_phone && (
                        <div className="flex items-start gap-3">
                          <Phone size={20} className="text-slate-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-600">Driver Contact</p>
                            <p className="font-semibold text-slate-900">{selectedOrder.driver_phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">{item.product_name}</p>
                          <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900">KES {parseFloat(item.total_price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-slate-900">KES {parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
