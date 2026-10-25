import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, StoreSettings } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Fallback Seed Products (Metro Bro Riding Masks)
const fallbackProducts: Product[] = [
  {
    id: 'mask-001',
    name: 'Metro Bro Riding Mask — Stealth Black',
    price: 650,
    description: 'High-density breathable windproof full-face riding balaclava. UV protective, sweat-wicking fabric engineered for long highway rides and city traffic.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    badge: 'FIRST DROP',
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mask-002',
    name: 'Metro Bro Riding Mask — Edition 02 (Carbon Gray)',
    price: 750,
    description: 'Ergonomic mesh breathing port, dual flat-seam construction to prevent helmet friction. All-weather riding shield.',
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
    badge: 'LIMITED',
    available: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mask-003',
    name: 'Metro Bro Riding Mask — Crimson Accent Edition',
    price: 790,
    description: 'Signature Metro Bro red accent stitching with thermal neck warmer extension. Designed for biker safety and bold style.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    badge: 'HOT',
    available: true,
    created_at: new Date().toISOString()
  }
];

// In-memory cache for fallback when Supabase is not connected
let memoryProducts: Product[] = [...fallbackProducts];
let memoryOrders: Order[] = [];

// ========================
// PRODUCTS API
// ========================
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using fallback products:', e);
    }
  }
  return memoryProducts;
}

export async function saveProduct(product: Product): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .upsert(product);
      if (!error) return true;
      console.error('Supabase upsert error:', error);
    } catch (e) {
      console.error('Failed to save to Supabase:', e);
    }
  }

  // Fallback update
  const index = memoryProducts.findIndex(p => p.id === product.id);
  if (index >= 0) {
    memoryProducts[index] = product;
  } else {
    memoryProducts.unshift(product);
  }
  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error('Failed to delete from Supabase:', e);
    }
  }
  memoryProducts = memoryProducts.filter(p => p.id !== id);
  return true;
}

// ========================
// ORDERS API
// ========================
export async function createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: 'ord_' + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();
      
      if (!error && data) {
        return data as Order;
      }
      console.error('Error saving order to Supabase:', error);
    } catch (e) {
      console.error('Failed to save order to Supabase:', e);
    }
  }

  memoryOrders.unshift(newOrder);
  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        return data as Order[];
      }
    } catch (e) {
      console.error('Failed to fetch orders from Supabase:', e);
    }
  }
  return memoryOrders;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (!error) return true;
    } catch (e) {
      console.error('Failed to update status in Supabase:', e);
    }
  }

  const order = memoryOrders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    return true;
  }
  return false;
}

// ========================
// STORE SETTINGS API
// ========================
let memorySettings: StoreSettings = {
  brandName: 'Metro Bro',
  whatsappNumber: '8801799767774',
  currency: '৳',
  notificationEmail: 'gamershishir26@gmail.com',
  deliveryInsideDhaka: 80,
  deliveryOutsideDhaka: 120
};

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'store_info')
        .single();
      
      if (!error && data?.value) {
        return {
          ...memorySettings,
          ...data.value
        };
      }
    } catch (e) {
      console.warn('Failed to fetch settings from Supabase:', e);
    }
  }
  return memorySettings;
}

export async function saveStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  memorySettings = {
    ...memorySettings,
    ...settings
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('store_settings')
        .upsert({
          key: 'store_info',
          value: memorySettings,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.error('Failed to save settings to Supabase:', e);
    }
  }

  return memorySettings;
}
