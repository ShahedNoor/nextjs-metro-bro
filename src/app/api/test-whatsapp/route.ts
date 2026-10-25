import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneNumberId = body.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = body.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    const recipientNumber = (body.recipientNumber || process.env.WHATSAPP_RECIPIENT_NUMBER || '8801799767774').replace(/\D/g, '');

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Please provide WhatsApp Phone Number ID and Access Token'
      }, { status: 400 });
    }

    const testMessage = `🧪 *METRO BRO — WhatsApp Cloud API Test*\n\nIf you see this message, your Meta WhatsApp Cloud API is configured successfully and working!`;

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
        to: recipientNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: testMessage
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test message sent successfully!',
        data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data?.error?.message || 'Meta API returned an error',
        data
      }, { status: 400 });
    }
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }, { status: 500 });
  }
}
