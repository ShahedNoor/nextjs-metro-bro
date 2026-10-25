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
    const updated = await saveStoreSettings({
      deliveryInsideDhaka: Number(body.deliveryInsideDhaka) || 80,
      deliveryOutsideDhaka: Number(body.deliveryOutsideDhaka) || 120,
      brandName: body.brandName,
      whatsappNumber: body.whatsappNumber,
      notificationEmail: body.notificationEmail,
    });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    );
  }
}
