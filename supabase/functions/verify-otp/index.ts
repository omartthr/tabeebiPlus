import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { phone, code } = await req.json()
    const cleanPhone = phone.replace(/\D/g, '')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data } = await supabase
      .from('phone_otps')
      .select('otp, expires_at')
      .eq('phone', cleanPhone)
      .single()

    if (!data) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Kod bulunamadı' }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    const expired = new Date(data.expires_at) < new Date()
    const valid = data.otp === code && !expired

    if (valid) {
      // Kullanılan kodu sil
      await supabase.from('phone_otps').delete().eq('phone', cleanPhone)
    }

    return new Response(
      JSON.stringify({ valid }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: err.message }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
