-- ========================================================
-- METRO BRO STORE — SUPABASE DATABASE SCHEMA & SEED DATA
-- Copy and run this script in your Supabase SQL Editor.
-- ========================================================

-- 1. Create PRODUCTS table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    image TEXT NOT NULL,
    badge TEXT DEFAULT '',
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create ORDERS table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_ref TEXT NOT NULL UNIQUE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    delivery_charge NUMERIC NOT NULL DEFAULT 80,
    total_price NUMERIC NOT NULL DEFAULT 0,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT 'Dhaka',
    address TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Cash on delivery (if available)',
    note TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    whatsapp_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create STORE_SETTINGS table
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) and set public policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- Allow all operations for now (or restrict with admin role)
CREATE POLICY "Allow admin all access to products" ON public.products
    FOR ALL USING (true);

-- Allow public to insert orders (checkout)
CREATE POLICY "Allow public insert to orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Allow read/update to orders
CREATE POLICY "Allow read update to orders" ON public.orders
    FOR ALL USING (true);

-- Allow read/write settings
CREATE POLICY "Allow access to store_settings" ON public.store_settings
    FOR ALL USING (true);

-- 5. Seed Initial Store Settings
INSERT INTO public.store_settings (key, value)
VALUES 
    ('store_info', '{"brandName": "Metro Bro", "whatsappNumber": "8801799767774", "currency": "৳", "notificationEmail": "gamershishir26@gmail.com"}'::jsonb),
    ('whatsapp_cloud_api', '{"phoneNumberId": "", "accessToken": "", "recipientNumber": "8801799767774"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 6. Seed Initial Products (Metro Bro Full Face Riding Masks)
INSERT INTO public.products (id, name, price, description, image, badge, available)
VALUES 
    (
        'mask-001',
        'Metro Bro Riding Mask — Stealth Black',
        650,
        'High-density breathable windproof full-face riding balaclava. UV protective, sweat-wicking fabric engineered for long highway rides and city traffic.',
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        'FIRST DROP',
        true
    ),
    (
        'mask-002',
        'Metro Bro Riding Mask — Edition 02 (Carbon Gray)',
        750,
        'Ergonomic mesh breathing port, dual flat-seam construction to prevent helmet friction. All-weather riding shield.',
        'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
        'LIMITED',
        true
    ),
    (
        'mask-003',
        'Metro Bro Riding Mask — Crimson Accent Edition',
        790,
        'Signature Metro Bro red accent stitching with thermal neck warmer extension. Designed for biker safety and bold style.',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        'HOT',
        true
    )
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    badge = EXCLUDED.badge;
