import axios from 'axios';

// Always use the Vite proxy path (/api/v1) so it works in both dev and Docker.
// The absolute VITE_API_URL is only used for direct backend calls outside the proxy.
const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Access Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh JWT Access Token on 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear auth details and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Mock Storage & Fallbacks (To guarantee a working platform if offline) =====

export const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Premium Bottled Water (500ml)',
    sku: 'KY-BTL-500',
    category: 'Bottled',
    volume_liters: 0.5,
    price: 35.00,
    stock_qty: 450,
    safety_level: 50,
    reorder_threshold: 100,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-2',
    name: 'Premium Bottled Water (1L)',
    sku: 'KY-BTL-1L',
    category: 'Bottled',
    volume_liters: 1.0,
    price: 60.00,
    stock_qty: 320,
    safety_level: 40,
    reorder_threshold: 80,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-3',
    name: 'Dispenser Bottle Refill (20L)',
    sku: 'KY-DSP-20L',
    category: 'Dispenser',
    volume_liters: 20.0,
    price: 350.00,
    stock_qty: 85,
    safety_level: 15,
    reorder_threshold: 30,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1548839133-9aa08246bc61?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-4',
    name: 'Bulk Tanker Water Supply (10,000L)',
    sku: 'KY-TNK-10K',
    category: 'Tanker',
    volume_liters: 10000.0,
    price: 8500.00,
    stock_qty: 12,
    safety_level: 2,
    reorder_threshold: 4,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
  },
];

export const MOCK_ORDERS = [
  {
    id: 'ord-101',
    tracking_number: 'KY-20260605-A7B8',
    customer_email: 'kelvin@kitayi.com',
    status: 'Delivered',
    total_amount: 1050.00,
    tax_amount: 144.83,
    discount_amount: 0.00,
    delivery_date: '2026-06-04',
    delivery_slot: 'Morning',
    payment_status: 'Paid',
    items: [
      { id: 'item-1', product_name: 'Dispenser Bottle Refill (20L)', quantity: 3, unit_price: 350.00, total_price: 1050.00 }
    ],
    created_at: '2026-06-03T10:15:30Z',
  },
  {
    id: 'ord-102',
    tracking_number: 'KY-20260605-F4D9',
    customer_email: 'kelvin@kitayi.com',
    status: 'In Transit',
    total_amount: 8500.00,
    tax_amount: 1172.41,
    discount_amount: 0.00,
    delivery_date: '2026-06-05',
    delivery_slot: 'Afternoon',
    payment_status: 'Paid',
    items: [
      { id: 'item-2', product_name: 'Bulk Tanker Water Supply (10,000L)', quantity: 1, unit_price: 8500.00, total_price: 8500.00 }
    ],
    created_at: '2026-06-05T08:30:00Z',
  },
  {
    id: 'ord-103',
    tracking_number: 'KY-20260605-Z1X2',
    customer_email: 'corporate@hospital.org',
    status: 'Pending',
    total_amount: 1400.00,
    tax_amount: 193.10,
    discount_amount: 0.00,
    delivery_date: '2026-06-06',
    delivery_slot: 'Morning',
    payment_status: 'Pending',
    items: [
      { id: 'item-3', product_name: 'Dispenser Bottle Refill (20L)', quantity: 4, unit_price: 350.00, total_price: 1400.00 }
    ],
    created_at: '2026-06-05T14:45:00Z',
  }
];

export const MOCK_SUBSCRIPTIONS = [
  {
    id: 'sub-201',
    product_name: 'Dispenser Bottle Refill (20L)',
    quantity: 2,
    frequency: 'Weekly',
    status: 'Active',
    next_delivery_date: '2026-06-12',
    billing_cycle: 'Prepaid',
    last_billed_date: '2026-06-05',
  },
  {
    id: 'sub-202',
    product_name: 'Premium Bottled Water (1L)',
    quantity: 5,
    frequency: 'Bi-Weekly',
    status: 'Paused',
    next_delivery_date: '2026-06-20',
    billing_cycle: 'Prepaid',
    last_billed_date: '2026-06-03',
  }
];

export const MOCK_PAYMENTS = [
  {
    id: 'pay-301',
    order_tracking: 'KY-20260605-A7B8',
    amount: 1050.00,
    provider: 'M-Pesa',
    transaction_reference: 'QWE789RTY',
    status: 'Successful',
    payment_date: '2026-06-03T10:18:22Z',
  },
  {
    id: 'pay-302',
    order_tracking: 'KY-20260605-F4D9',
    amount: 8500.00,
    provider: 'Stripe',
    transaction_reference: 'ch_stripe_5a6b7c',
    status: 'Successful',
    payment_date: '2026-06-05T08:35:10Z',
  }
];

export const MOCK_VEHICLES = [
  {
    id: 'v-1',
    plate_number: 'KBA 123X',
    model: 'Isuzu Elf (Medium Tanker)',
    capacity_liters: 5000.00,
    status: 'Available',
    maintenance_due_date: '2026-07-15',
    fuel_usage: 12.5,
  },
  {
    id: 'v-2',
    plate_number: 'KCD 456Y',
    model: 'Fuso Fighter (Large Tanker)',
    capacity_liters: 10000.00,
    status: 'In Use',
    maintenance_due_date: '2026-06-30',
    fuel_usage: 18.2,
  },
  {
    id: 'v-3',
    plate_number: 'KDG 789Z',
    model: 'Toyota Dyna (Delivery Box)',
    capacity_liters: 2000.00,
    status: 'Maintenance',
    maintenance_due_date: '2026-06-10',
    fuel_usage: 9.8,
  }
];

// ===== Real API Service Functions =====

// --- Products ---
export const productsApi = {
  list: (params?: { search?: string; ordering?: string }) =>
    api.get('/products/', { params }),
  get: (id: string) => api.get(`/products/${id}/`),
};

// --- Orders ---
export const ordersApi = {
  list: () => api.get('/orders/'),
  get: (id: string) => api.get(`/orders/${id}/`),
  create: (data: {
    items: { product: string; quantity: number }[];
    delivery_address: string;
    delivery_date: string;
    delivery_slot: string;
    coupon_code?: string;
  }) => api.post('/orders/', data),
  cancel: (id: string) => api.post(`/orders/${id}/cancel/`),
  validateCoupon: (code: string) =>
    api.get('/orders/coupons/validate/', { params: { code } }),
};

// --- Payments ---
export const paymentsApi = {
  list: () => api.get('/payments/'),
  mpesaPush: (order_id: string) =>
    api.post('/payments/pay-mpesa/', { order_id }),
  stripeCheckout: (order_id: string) =>
    api.post('/payments/pay-stripe/', { order_id }),
};

// --- Subscriptions ---
export const subscriptionsApi = {
  list: () => api.get('/subscriptions/'),
  create: (data: {
    product: string;
    quantity: number;
    frequency: string;
    next_delivery_date: string;
    billing_cycle?: string;
  }) => api.post('/subscriptions/', data),
  update: (id: string, data: Partial<{ status: string; quantity: number; frequency: string }>) =>
    api.patch(`/subscriptions/${id}/`, data),
};

// --- Deliveries ---
export const deliveriesApi = {
  list: () => api.get('/deliveries/'),
  get: (id: string) => api.get(`/deliveries/${id}/`),
  updateStatus: (id: string, status: string) =>
    api.post(`/deliveries/${id}/status/`, { status }),
  verify: (id: string, code: string) =>
    api.post(`/deliveries/${id}/verify/`, { code }),
  vehicles: () => api.get('/deliveries/vehicles/'),
};

// --- Customers ---
export const customersApi = {
  me: () => api.get('/auth/me/'),
  addresses: () => api.get('/customers/addresses/'),
  createAddress: (data: {
    address_type: string;
    street_address: string;
    city: string;
    postal_code: string;
    is_default?: boolean;
  }) => api.post('/customers/addresses/', data),
};
