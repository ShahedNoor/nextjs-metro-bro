import { NextRequest, NextResponse } from 'next/server';
import { getProducts, saveProduct, deleteProduct } from '@/lib/supabase';
import { Product } from '@/types';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product: Product = {
      id: body.id || 'mask-' + Date.now().toString().slice(-4),
      name: body.name,
      price: Number(body.price) || 0,
      description: body.description || '',
      image: body.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      badge: body.badge || '',
      available: body.available !== false,
      created_at: body.created_at || new Date().toISOString()
    };

    const saved = await saveProduct(product);
    if (saved) {
      return NextResponse.json({ success: true, product });
    }
    return NextResponse.json({ error: 'Failed to save product' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const deleted = await deleteProduct(id);
    return NextResponse.json({ success: deleted });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
