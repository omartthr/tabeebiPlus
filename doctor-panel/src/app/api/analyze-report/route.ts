import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: base64Pdf,
                }
              },
              {
                text: `Sen bir tıbbi rapor asistanısın. Sana bir doktor tarafından yazılmış tıbbi rapor verilecek.

Görevin:
1. Raporu dikkatlice oku
2. Hastanın anlayabileceği sade ve samimi bir dille Türkçe özetle
3. Teknik terimleri parantez içinde kısaca açıkla (örn: "hipertansiyon (yüksek tansiyon)")
4. Kesinlikle şu 3 bölümü kullan, başka bir şey ekleme:

📋 Genel Durum
(Hastanın genel sağlık durumu hakkında 1-2 cümle)

🔍 Önemli Bulgular
(Rapordaki kritik bulgular, madde madde)

💊 Öneriler
(Doktorun önerileri veya yapılması gerekenler)

Ton: Hastayı endişelendirme, sakin ve anlaşılır ol. Maksimum 200 kelime.

Özetin en sonuna her zaman şu notu ekle:
"⚠️ Bu özet yapay zeka tarafından oluşturulmuştur. Kesin tanı ve tedavi için lütfen doktorunuza danışınız."`
              }
            ]
          }]
        }),
      }
    );

    let aiSummary = 'Özet oluşturulamadı.';
    if (geminiRes.ok) {
      const geminiData = await geminiRes.json();
      aiSummary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? aiSummary;
    } else {
      const geminiErr = await geminiRes.text();
      console.error('Gemini error status:', geminiRes.status, geminiErr);
    }

    const { error: dbError } = await supabase
      .from('appointments')
      .update({ pdf_url: pdfUrl, ai_summary: aiSummary, report_uploaded: true })
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
