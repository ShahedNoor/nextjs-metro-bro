import { NextRequest, NextResponse } from 'next/server';
import { testTelegramBot } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = body.chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: 'Please provide both Telegram Bot Token and Chat ID' },
        { status: 400 }
      );
    }

    const result = await testTelegramBot(token, chatId);
    if (result.success) {
      return NextResponse.json({ success: true, message: result.statusText });
    }
    return NextResponse.json({ error: result.statusText }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
