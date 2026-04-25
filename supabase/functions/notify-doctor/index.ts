// @ts-nocheck — Deno runtime
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const FROM_WA      = 'whatsapp:+14155238886';

const CORS = {
  // Canlıya geçişte '*' yerine 'https://tabeebi.app' gibi kendi domainini yazmalısın.
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendWhatsApp(to: string, body: string) {
  const params = new URLSearchParams({ From: FROM_WA, To: `whatsapp:+${to}`, Body: body });
  const resp = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    }
  );
  return resp.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // type: 'approved' | 'received'
    const { phone, name, type = 'approved' } = await req.json();
    const clean = String(phone).replace(/\D/g, '').replace(/^0/, '');

    let message: string;

    if (type === 'received') {
      message =
        `Merhaba Dr. ${name}, 👋\n\n` +
        `tabeebi+ başvurunuz başarıyla alındı.\n\n` +
        `Ekibimiz bilgilerinizi inceledikten sonra en kısa sürede size bu WhatsApp hattı üzerinden bilgi verecektir.\n\n` +
        `Sabırlı beklediğiniz için teşekkür ederiz. 🙏\n\n` +
        `— tabeebi+ Ekibi`;
    } else {
      message =
        `🎉 Tebrikler Dr. ${name}!\n\n` +
        `tabeebi+ doktor hesabınız onaylandı. Artık aşağıdaki adresten panele giriş yapabilirsiniz:\n\n` +
        `https://tabeebi.app/doctor\n\n` +
        `Sorunuz için: support@tabeebi.app`;
    }

    const data = await sendWhatsApp(clean, message);

    return new Response(JSON.stringify({ ok: true, sid: data.sid }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
