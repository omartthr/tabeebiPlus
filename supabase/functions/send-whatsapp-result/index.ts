import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
// Twilio WhatsApp gönderici numaranız (Örn: whatsapp:+14155238886)
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER') || 'whatsapp:+14155238886' 

serve(async (req) => {
  try {
    const { phone, appointmentId, type = 'result', date, time, doctorName } = await req.json()
    
    // Numarayı uluslararası formata çevirme (+964)
    const formattedPhone = phone.startsWith('+') ? phone : `+964${phone}`

    let messageBody = '';
    if (type === 'created') {
      messageBody = `Merhaba! 🏥 Tabeebi+ panelinden adınıza Dr. ${doctorName || ''} ile *${date}* günü saat *${time}* için bir muayene randevusu oluşturuldu. 

Randevunuzu takip etmek ve onaylamak için Tabeebi+ uygulamasını indirin ve *${phone}* numaranızla giriş yapın. 
    
📱 Uygulama Linki: https://tabeebi.plus/app`;
    } else {
      messageBody = `Merhaba! 🏥 Tabeebi+ doktorunuz muayene sonuçlarınızı sisteme yükledi. Sonuçlarınızı görmek, randevularınızı takip etmek ve profilinizi aktifleştirmek için Tabeebi+ uygulamasını indirin ve *${phone}* numaranızla giriş yapın. 
    
📱 Uygulama Linki: https://tabeebi.plus/app`;
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const body = new URLSearchParams({
      To: `whatsapp:${formattedPhone}`,
      From: TWILIO_WHATSAPP_NUMBER,
      Body: messageBody
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const result = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio Error:', result);
      return new Response(JSON.stringify({ error: result }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ success: true, message: "WhatsApp message sent!" }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (err: any) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
