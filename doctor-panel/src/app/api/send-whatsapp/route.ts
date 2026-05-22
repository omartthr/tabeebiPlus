import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, appointmentId, type, date, time, doctorName } = body;

    if (!phone || !appointmentId) {
      return NextResponse.json({ error: 'Telefon numarası veya randevu ID eksik.' }, { status: 400 });
    }

    console.log(`[API /send-whatsapp] Server-side Edge Function invocation requested for phone: ${phone}`);

    // Call Supabase Edge Function from server-side Node.js environment
    const { error: invokeError } = await supabase.functions.invoke('send-whatsapp-result', {
      body: { phone, appointmentId, type, date, time, doctorName }
    });

    if (invokeError) {
      console.error('[API /send-whatsapp] Edge function invocation error:', invokeError);
      return NextResponse.json({ error: invokeError.message || invokeError }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'WhatsApp message triggered successfully.' });
  } catch (err: any) {
    console.error('[API /send-whatsapp] Server-side error:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
