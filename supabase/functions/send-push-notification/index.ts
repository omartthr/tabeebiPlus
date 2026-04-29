import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { patient_id, title, body, data = {} } = await req.json()

    // 1. Get patient's push token
    const { data: patient, error: pError } = await supabase
      .from('patients')
      .select('push_token')
      .eq('id', patient_id)
      .single()

    if (pError || !patient?.push_token) {
      console.warn(`No push token found for patient ${patient_id}`)
      // Even if no push token, we still save to notifications table
    }

    // 2. Save to notifications table for history
    const { error: nError } = await supabase
      .from('notifications')
      .insert({
        patient_id,
        title,
        body,
        data: { ...data, sent_at: new Date().toISOString() }
      })

    if (nError) throw nError

    // 3. Send to Expo if token exists
    if (patient?.push_token) {
      const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
        },
        body: JSON.stringify({
          to: patient.push_token,
          title,
          body,
          data,
          sound: 'default',
          badge: 1,
        }),
      })
      const expoData = await expoRes.json()
      console.log('Expo Response:', expoData)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
