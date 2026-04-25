// @ts-nocheck — Deno runtime (Supabase Edge Functions)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  // Canlıya geçişte '*' yerine 'https://tabeebi.app' gibi kendi domainini yazmalısın.
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// WhatsApp Sandbox (Twilio default)
const WHATSAPP_FROM = 'whatsapp:+14155238886'
// SMS sender — Twilio Console'dan satın alınan/trial numara
// Secrets'a TWILIO_PHONE_NUMBER ekle (örn: +15005550006 veya satın aldığın number)
const SMS_FROM_DEFAULT = Deno.env.get('TWILIO_PHONE_NUMBER') || ''

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { phone, country_code } = await req.json()
    const cleanInput = String(phone).replace(/\D/g, '').replace(/^0/, '')

    const cc = country_code ? String(country_code).replace(/\D/g, '') : '964'
    const fullPhone = cleanInput.startsWith(cc) ? cleanInput : `${cc}${cleanInput}`

    // Channel kararı: TR (+90) → SMS, diğerleri (IQ vb.) → WhatsApp
    const useSms = cc === '90'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    const phoneKey = country_code ? fullPhone : cleanInput

    const { error: dbError } = await supabase
      .from('phone_otps')
      .upsert({ phone: phoneKey, otp, expires_at: expiresAt })

    if (dbError) throw new Error(dbError.message)

    // Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const authToken  = Deno.env.get('TWILIO_AUTH_TOKEN')!

    const messageBody = `Tabeebi+ dogrulama kodunuz: ${otp}\n\nBu kod 5 dakika gecerlidir.`

    let from: string
    let to: string

    if (useSms) {
      if (!SMS_FROM_DEFAULT) {
        throw new Error('TWILIO_PHONE_NUMBER secret tanımlı değil. Twilio Console’dan SMS numarası satın al ve secret olarak ekle.')
      }
      from = SMS_FROM_DEFAULT
      to   = `+${fullPhone}`
    } else {
      from = WHATSAPP_FROM
      to   = `whatsapp:+${fullPhone}`
    }

    const body = new URLSearchParams({
      From: from,
      To:   to,
      Body: messageBody,
    })

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    )

    const twilioData = await twilioRes.json()

    if (!twilioRes.ok) {
      console.error('Twilio error:', twilioData)
      throw new Error(twilioData.message || `${useSms ? 'SMS' : 'WhatsApp'} gönderilemedi`)
    }

    console.log(`OTP sent via ${useSms ? 'SMS' : 'WhatsApp'} to ${fullPhone}, sid: ${twilioData.sid}`)

    return new Response(
      JSON.stringify({ success: true, channel: useSms ? 'sms' : 'whatsapp', sid: twilioData.sid }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('send-otp error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
