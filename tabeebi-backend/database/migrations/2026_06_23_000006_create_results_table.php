<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Muayene sonuçları tablosu — Doktorlar yükler, hastalar okur.
     * meds: İlaç listesi JSON array olarak saklanır (PostgreSQL'de JSONB).
     * unread: Hasta sonucu ilk kez açtığında false yapılır.
     */
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->uuid('patient_id')->nullable();
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');

            $table->uuid('doctor_id')->nullable();
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('set null');

            $table->uuid('appointment_id')->nullable();
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('set null');

            $table->string('title');
            $table->text('diagnosis')->nullable();
            $table->text('notes')->nullable();
            $table->json('meds')->nullable();      // ["İlaç 1", "İlaç 2"] — Supabase'de TEXT[]
            $table->text('next_steps')->nullable();
            $table->boolean('unread')->default(true);
            $table->string('date');                // "YYYY-MM-DD" formatı

            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
