export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  available: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  order_ref: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customer_name: string;
  phone: string;
  address: string;
  payment_method: string;
  note?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  whatsapp_sent?: boolean;
  created_at: string;
}

export interface StoreSettings {
  brandName: string;
  whatsappNumber: string;
  currency: string;
  notificationEmail: string;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  recipientNumber: string;
}
