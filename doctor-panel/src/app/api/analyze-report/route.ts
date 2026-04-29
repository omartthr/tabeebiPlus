import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  console.log('--- [DEBUG] /api/analyze-report ISTEDI GELDI! ---');
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const appointmentId = formData.get('appointmentId') as string;

    if (!file || !appointmentId) {
      return NextResponse.json({ error: 'Dosya veya randevu ID eksik.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileName = `${appointmentId}_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, fileBuffer, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'PDF yükleme hatası: ' + uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('reports').getPublicUrl(fileName);
    const pdfUrl = urlData.publicUrl;

    const base64Pdf = Buffer.from(fileBuffer).toString('base64');

    // Supabase Edge Function'ı çağırıyoruz
    const { data: functionData, error: functionError } = await supabase.functions.invoke('analyze-report', {
      body: { appointmentId, base64Pdf }
    });

    let aiSummary = 'Özet oluşturulamadı.';
    if (functionError) {
      console.error('Edge Function (Gemini) error, ama devam ediliyor:', functionError);
      aiSummary = 'Yapay zeka analiz servisi şu an yoğun. Lütfen daha sonra tekrar deneyin.';
      // Hata fırlatmak yerine devam ediyoruz ki PDF kaydı ve WhatsApp mesajı çalışsın.
    } else {
      aiSummary = functionData?.aiSummary || aiSummary;
    }

    // Veritabanında PDF URL'ini güncelleyelim
    const { error: dbError } = await supabase
      .from('appointments')
      .update({ pdf_url: pdfUrl, report_uploaded: true })
      .eq('id', appointmentId);

    if (dbError) {
      console.error('DB update error:', dbError);
      return NextResponse.json({ error: 'DB güncelleme hatası: ' + dbError.message }, { status: 500 });
    }

    // Hasta kayıtlı mı kontrol et ve değilse WhatsApp mesajı gönder
    const { data: aptData } = await supabase
      .from('appointments')
      .select('patient_phone, patients(phone, is_registered)')
      .eq('id', appointmentId)
      .single();

    // Eğer patient kaydı yoksa (is_registered false demektir) VEYA patient kaydı var ama is_registered false ise
    const phoneToSend = aptData?.patients?.phone || aptData?.patient_phone;
    const isRegistered = aptData?.patients?.is_registered ?? false;

    if (phoneToSend && isRegistered === false) {
      console.log(`[WhatsApp] Kayıt dışı hasta tespit edildi, mesaj gönderiliyor: ${phoneToSend}`);
      
      // WhatsApp gönderimi için Supabase Edge Function'ı çağır (veya Twilio API)
      const { error: wpError } = await supabase.functions.invoke('send-whatsapp-result', {
        body: { phone: phoneToSend, appointmentId }
      });
      
      if (wpError) {
        console.error('WhatsApp gönderim hatası:', wpError);
        // Hata olsa bile API yanıtını bozmuyoruz, çünkü analiz başarılı
      }
    }

    return NextResponse.json({ pdfUrl, aiSummary });
  } catch (err: any) {
    console.error('Analyze report error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
