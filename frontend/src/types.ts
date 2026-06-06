export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  sku?: string;
  stock_qty?: number;
  safety_level?: number;
  image_url?: string;
  volume_liters?: number;
}

export interface OrderItem {
  id?: string;
  product: string | Product;
  product_name?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
}

export interface Order {
  id: string;
  tracking_number: string;
  customer_email?: string;
  status: string;
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  delivery_date?: string;
  delivery_slot?: string;
  payment_status?: string;
  items: OrderItem[];
  created_at?: string;
  driver_name?: string;
  vehicle_plate?: string;
}

export interface Vehicle {
  id: string;
  model?: string;
  plate_number?: string;
  status?: 'Available' | 'In Use' | 'Maintenance' | string;
  capacity_liters?: number;
  fuel_usage?: number | string;
  maintenance_due_date?: string;
}

export interface Subscription {
  id: string;
  product_name: string;
  quantity: number;
  frequency: string;
  status: string;
  next_delivery_date?: string;
  billing_cycle?: string;
  last_billed_date?: string;
}

export interface Payment {
  id: string;
  order_tracking?: string;
  amount: number;
  provider?: string;
  transaction_reference?: string;
  status: string;
  payment_date?: string;
}

export type CartItem = { product: Product; qty: number };
