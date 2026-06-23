<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Randevular tablosu — Projenin ana tablosu.
     * 23 kolon — Supabase'deki en büyük tablo.
     *
     * doctor_id: Onaylanmış doctors.id (mobil uygulama oluşturursa)
     * doctor_registration_id: Doktor paneli üzerinden oluşturulan randevular için
     * patient_name / patient_phone: Doktor panelinden geçici hasta kaydı için
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            // İlişkiler
            $table->uuid('patient_id')->nullable();
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');

            $table->uuid('doctor_id')->nullable();
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('set null');

            $table->uuid('doctor_registration_id')->nullable();
            $table->foreign('doctor_registration_id')->references('id')->on('doctor_registrations')->onDelete('set null');

            // Zamanlama
            $table->string('date');               // "YYYY-MM-DD"
            $table->string('time');               // "10:00"
            $table->integer('duration')->nullable(); // Dakika

            // Durum ve ödeme
            $table->string('status')->default('pending'); // pending|confirmed|completed|cancelled
            $table->string('payment')->default('cash');   // online|cash

            // Detaylar
            $table->string('clinic')->nullable();
            $table->text('notes')->nullable();
            $table->text('reason')->nullable();   // Randevu nedeni (şikayet)
            $table->string('price')->nullable();  // Ücret snapshot

            // Doktor paneli geçici hasta alanları
            $table->string('patient_name')->nullable();
            $table->string('patient_phone')->nullable();

            // Rapor ve AI
            $table->boolean('report_uploaded')->default(false);
            $table->text('pdf_url')->nullable();
            $table->text('ai_summary')->nullable();
            $table->boolean('reported')->default(false);

            // Bildirim ve değerlendirme
            $table->boolean('reminder_sent')->default(false);
            $table->integer('rating')->nullable();  // 1-5 hasta puanı
            $table->text('review')->nullable();     // Hasta yorumu

            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
