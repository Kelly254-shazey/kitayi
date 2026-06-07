import axios, { type InternalAxiosRequestConfig } from 'axios';

// Match the environment variable provided in CI/CD pipeline
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Extend the Axios config type to include our custom property
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
    if (token) {
      config.headers?.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh JWT Access Token on 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomRequestConfig;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);
          
          originalRequest.headers?.set('Authorization', `Bearer ${newAccessToken}`);
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Real API Service Functions =====

// --- Auth ---
export const authApi = {
  logout: () => {
    // 1. Always clear local storage first so the UI updates immediately
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // 2. Redirect to login
    window.location.href = '/login';
  },
};

// --- Products ---
export const productsApi = {
  list: (params?: { search?: string; ordering?: string }) =>
    api.get('/products/', { params }),
  get: (id: string) => api.get(`/products/${id}/`),
  create: (data: FormData) => api.post('/products/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
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
  lookupBill: (accountNumber: string) =>
    api.get('/customers/bill-lookup/', { params: { account_number: accountNumber } }),
  createAddress: (data: {
    address_type: string;
    street_address: string;
    city: string;
    postal_code: string;
    is_default?: boolean;
  }) => api.post('/customers/addresses/', data),
};

// --- Public Communications ---
export const communicationsApi = {
  contactInquiry: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => api.post('/communications/contact-inquiries/', data),
  newsletterSubscribe: (email: string) =>
    api.post('/communications/newsletter/', { email }),
};
