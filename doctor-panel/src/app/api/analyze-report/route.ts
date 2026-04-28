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

    if (functionError) {
      console.error('Edge Function error:', functionError);
      return NextResponse.json({ error: 'Analiz fonksiyonu hatası: ' + functionError.message }, { status: 500 });
    }

    const aiSummary = functionData?.aiSummary || 'Özet oluşturulamadı.';

    // Veritabanında PDF URL'ini de güncelleyelim (Özet zaten Edge Function içinde güncelleniyor)
    const { error: dbError } = await supabase
      .from('appointments')
      .update({ pdf_url: pdfUrl, report_uploaded: true })
      .eq('id', appointmentId);

    if (dbError) {
      console.error('DB update error:', dbError);
      return NextResponse.json({ error: 'DB güncelleme hatası: ' + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ pdfUrl, aiSummary });
  } catch (err: any) {
    console.error('Analyze report error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
