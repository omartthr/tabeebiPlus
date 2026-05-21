import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './doctor-panel/.env.local' });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(URL, KEY);

async function check() {
  // Try sending an OTP first
  const phone = '905378569440';
  console.log('Sending OTP...');
  const { data: sendData, error: sendErr } = await supabase.functions.invoke('send-otp', {
    body: { phone, country_code: '90' }
  });
  console.log('Send OTP result:', sendData, sendErr);

  // We can't easily get the OTP without reading the DB.
  // Wait, I can read the OTP from phone_otps table since I am not using RLS on scratch if I use service role, 
  // but I only have ANON key. Let's try selecting from phone_otps.
  const { data: otps } = await supabase.from('phone_otps').select('otp').eq('phone', phone).order('created_at', { ascending: false }).limit(1);
  if (!otps || otps.length === 0) {
    console.log('Could not read OTP from DB');
    return;
  }
  const code = otps[0].otp;
  console.log('Found OTP in DB:', code);

  console.log('Verifying OTP...');
  const { data: verifyData, error: verifyErr } = await supabase.functions.invoke('verify-otp', {
    body: { phone, code }
  });
  
  console.log('Verify OTP result:', JSON.stringify(verifyData, null, 2));
  console.log('Verify OTP error:', verifyErr);
}
check();
