import { NextRequest, NextResponse } from 'next/server';
import { getOrders, updateOrderStatus } from '@/lib/supabase';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const updated = await updateOrderStatus(orderId, status);
    return NextResponse.json({ success: updated });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
