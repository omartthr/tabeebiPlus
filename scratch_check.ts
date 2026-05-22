import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './doctor-panel/.env.local' });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(URL, KEY);

async function check() {
  const { data: apts } = await supabase.from('appointments').select('*').limit(1);
  const apt = apts?.[0];
  if (!apt) {
    console.log('No appointments found to test with.');
    return;
  }
  
  console.log('Testing notification insert for patient:', apt.patient_id);
  
  const { data, error } = await supabase.from('notifications').insert({
    patient_id: apt.patient_id,
    unread: true,
    title: 'Muayeneniz Tamamlandı! ⭐',
    body: `Dr. Test ile olan randevunuz tamamlandı. Doktorunuzu değerlendirmek ister misiniz?`,
    type: 'rating',
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    created_at: new Date().toISOString()
  });
  
  if (error) {
    console.error('Error inserting notification:', error);
  } else {
    console.log('Success inserting notification:', data);
  }
}
check();
