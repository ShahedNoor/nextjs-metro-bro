import { Order } from '@/types';
import { getStoreSettings } from '@/lib/supabase';

export interface TelegramResult {
  success: boolean;
  statusText: string;
}

/**
 * Send an automated Telegram message to your Bot/Group whenever an order is placed
 */
export async function sendTelegramNotification(order: Order): Promise<TelegramResult> {
  const settings = await getStoreSettings().catch(() => null);
  const botToken = settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = settings?.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      success: false,
      statusText: 'Telegram bot credentials not configured in backend settings'
    };
  }

  const message = `🏍️ *NEW ORDER — METRO BRO STORE*
━━━━━━━━━━━━━━━━━━━━
📦 *Order Ref:* \`${order.order_ref}\`
🏷️ *Product:* ${escapeMarkdown(order.product_name)}
🔢 *Quantity:* ${order.quantity} × ৳${order.unit_price}
🚚 *Delivery Area:* ${escapeMarkdown(order.district)} (৳${order.delivery_charge})
💰 *Total Payable:* *৳${order.total_price.toLocaleString('en-BD')}*

👤 *Customer:* ${escapeMarkdown(order.customer_name)}
📞 *Phone:* \`${order.phone}\`
📍 *Address:* ${escapeMarkdown(order.address)}
💳 *Payment:* ${escapeMarkdown(order.payment_method)}
${order.note ? `📝 *Note:* ${escapeMarkdown(order.note)}\n` : ''}━━━━━━━━━━━━━━━━━━━━
⚡ *Action:* Please call customer to verify order and arrange delivery.`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, statusText: 'Telegram alert delivered successfully!' };
    }
    return {
      success: false,
      statusText: data.description || 'Telegram API returned an error'
    };
  } catch (error) {
    console.error('Telegram notification error:', error);
    return {
      success: false,
      statusText: error instanceof Error ? error.message : 'Network error sending Telegram notification'
    };
  }
}

/**
 * Test Telegram bot connection directly with token & chatId
 */
export async function testTelegramBot(token: string, chatId: string): Promise<TelegramResult> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '⚡ *Metro Bro Store Test Notification*\n\nYour Telegram bot is successfully connected to your Next.js store! All new customer orders will ding right here.',
        parse_mode: 'Markdown'
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, statusText: 'Test message sent to your Telegram successfully!' };
    }
    return { success: false, statusText: data.description || 'Failed to send Telegram message' };
  } catch (error) {
    return {
      success: false,
      statusText: error instanceof Error ? error.message : 'Network error communicating with Telegram'
    };
  }
}

function escapeMarkdown(text: string): string {
  return String(text || '').replace(/([_*`\[\]])/g, '\\$1');
}
