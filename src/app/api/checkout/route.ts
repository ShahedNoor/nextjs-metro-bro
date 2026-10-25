import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/supabase';
import { sendWhatsAppNotification, buildDirectWhatsAppUrl } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      productName,
      quantity,
      unitPrice,
      customerName,
      phone,
      address,
      paymentMethod,
      note
    } = body;

    if (!customerName || !phone || !address || !productId) {
      return NextResponse.json(
        { error: 'Missing required checkout fields' },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
    const price = Number(unitPrice) || 0;
    const totalPrice = price * qty;
    const orderRef = 'MB-' + Date.now().toString().slice(-8);

    // Save order into Supabase
    const order = await createOrder({
      order_ref: orderRef,
      product_id: productId,
      product_name: productName || 'Metro Bro Mask',
      quantity: qty,
      unit_price: price,
      total_price: totalPrice,
      customer_name: customerName,
      phone: phone,
      address: address,
      payment_method: paymentMethod || 'Cash on delivery (if available)',
      note: note || '',
      status: 'pending',
      whatsapp_sent: false
    });

    // Try sending WhatsApp Cloud API Notification
    const waResult = await sendWhatsAppNotification(order);

    const directWhatsAppUrl = buildDirectWhatsAppUrl(order);

    return NextResponse.json({
      success: true,
      order,
      directWhatsAppUrl,
      whatsappStatus: waResult
    });
  } catch (error: unknown) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
