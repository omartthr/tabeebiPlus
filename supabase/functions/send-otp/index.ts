import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { phone } = await req.json()
    const cleanPhone = phone.replace(/\D/g, '')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 4 haneli OTP üret
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 dakika

    // Veritabanına kaydet
    const { error: dbError } = await supabase
      .from('phone_otps')
      .upsert({ phone: cleanPhone, otp, expires_at: expiresAt })

    if (dbError) throw new Error(dbError.message)

    // Twilio WhatsApp Sandbox üzerinden gönder
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')!

    const body = new URLSearchParams({
      From: 'whatsapp:+14155238886', // Twilio Sandbox numarası
      To: `whatsapp:+964${cleanPhone}`,
      Body: `Tabeebi+ doğrulama kodunuz: *${otp}*\n\nBu kod 5 dakika geçerlidir.`,
    })

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    )

    const twilioData = await twilioRes.json()

    if (!twilioRes.ok) {
      throw new Error(twilioData.message || 'WhatsApp gönderilemedi')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
