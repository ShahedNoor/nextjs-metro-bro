import { Order } from '@/types';
import { getStoreSettings } from '@/lib/supabase';

export interface WhatsAppSendResult {
  success: boolean;
  statusText: string;
  response?: unknown;
}

export async function sendWhatsAppNotification(order: Order): Promise<WhatsAppSendResult> {
  const settings = await getStoreSettings().catch(() => null);
  const phoneNumberId = settings?.whatsappPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = settings?.whatsappAccessToken || process.env.WHATSAPP_ACCESS_TOKEN;
  const recipient = (settings?.whatsappNumber || process.env.WHATSAPP_RECIPIENT_NUMBER || '8801799767774').replace(/\D/g, '');

  if (!phoneNumberId || !accessToken) {
    console.log('[WhatsApp Cloud API] Credentials not configured yet. Skipping automated API send.');
    return {
      success: false,
      statusText: 'WhatsApp Cloud API credentials not configured in backend settings'
    };
  }

  const itemsSubtotal = order.unit_price * order.quantity;
  const delivery = order.delivery_charge || (order.district?.toLowerCase() === 'dhaka' ? 80 : 120);

  const messageText = [
    `🛵 *NEW METRO BRO ORDER RECEIVED!*`,
    `Ref: *${order.order_ref}*`,
    `------------------------------------`,
    `*Product:* ${order.product_name}`,
    `*Quantity:* ${order.quantity}`,
    `*Unit Price:* ৳${order.unit_price}`,
    `*Items Subtotal:* ৳${itemsSubtotal.toLocaleString('en-BD')}`,
    `*Delivery Area:* ${order.district || 'Dhaka'} (৳${delivery})`,
    `*Total Payable:* ৳${order.total_price.toLocaleString('en-BD')}`,
    `------------------------------------`,
    `*Customer Name:* ${order.customer_name}`,
    `*Phone:* ${order.phone}`,
    `*District:* ${order.district || 'Dhaka'}`,
    `*Address:* ${order.address}`,
    `*Payment:* ${order.payment_method}`,
    `*Note:* ${order.note || 'None'}`,
    `------------------------------------`,
    `⚡ Please contact customer to confirm delivery.`
  ].join('\n');

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('[WhatsApp Cloud API] Notification sent successfully:', data);
      return { success: true, statusText: 'Message sent via WhatsApp Cloud API', response: data };
    } else {
      console.error('[WhatsApp Cloud API] Error from Meta Graph API:', data);
      return { 
        success: false, 
        statusText: data?.error?.message || 'Meta API returned an error', 
        response: data 
      };
    }
  } catch (error: unknown) {
    console.error('[WhatsApp Cloud API] Network error:', error);
    return {
      success: false,
      statusText: error instanceof Error ? error.message : 'Unknown network error'
    };
  }
}

export function buildDirectWhatsAppUrl(order: Order, recipientPhone: string = '8801799767774'): string {
  const digits = recipientPhone.replace(/\D/g, '');
  const itemsSubtotal = order.unit_price * order.quantity;
  const delivery = order.delivery_charge || (order.district?.toLowerCase() === 'dhaka' ? 80 : 120);

  const message = [
    `*NEW ORDER REQUEST — Metro Bro*`,
    `Order reference: ${order.order_ref}`,
    ``,
    `Product: ${order.product_name}`,
    `Quantity: ${order.quantity}`,
    `Unit price: ৳${order.unit_price}`,
    `Items Subtotal: ৳${itemsSubtotal.toLocaleString('en-BD')}`,
    `Delivery Area: ${order.district || 'Dhaka'} (৳${delivery})`,
    `*Total Payable:* ৳${order.total_price.toLocaleString('en-BD')}`,
    ``,
    `Customer: ${order.customer_name}`,
    `Phone: ${order.phone}`,
    `District: ${order.district || 'Dhaka'}`,
    `Address: ${order.address}`,
    `Payment preference: ${order.payment_method}`,
    `Note: ${order.note || 'None'}`,
    ``,
    `Please confirm stock and delivery scheduling.`
  ].join('\n');

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
