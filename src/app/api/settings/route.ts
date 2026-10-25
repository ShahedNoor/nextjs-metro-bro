import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, saveStoreSettings } from '@/lib/supabase';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await getStoreSettings();
    const updated = await saveStoreSettings({
      ...current,
      deliveryInsideDhaka: body.deliveryInsideDhaka !== undefined ? Number(body.deliveryInsideDhaka) : current.deliveryInsideDhaka,
      deliveryOutsideDhaka: body.deliveryOutsideDhaka !== undefined ? Number(body.deliveryOutsideDhaka) : current.deliveryOutsideDhaka,
      brandName: body.brandName !== undefined ? body.brandName : current.brandName,
      whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : current.whatsappNumber,
      notificationEmail: body.notificationEmail !== undefined ? body.notificationEmail : current.notificationEmail,
      telegramBotToken: body.telegramBotToken !== undefined ? body.telegramBotToken : current.telegramBotToken,
      telegramChatId: body.telegramChatId !== undefined ? body.telegramChatId : current.telegramChatId,
      whatsappPhoneNumberId: body.whatsappPhoneNumberId !== undefined ? body.whatsappPhoneNumberId : current.whatsappPhoneNumberId,
      whatsappAccessToken: body.whatsappAccessToken !== undefined ? body.whatsappAccessToken : current.whatsappAccessToken
    });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    );
  }
}
