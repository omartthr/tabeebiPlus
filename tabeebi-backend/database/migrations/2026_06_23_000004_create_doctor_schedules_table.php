<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Doktor çalışma saatleri tablosu.
     * Her doktor kaydına karşılık 1 satır bulunur (upsert mantığı).
     * schedule JSONB: {"mon":{"isOpen":true,"slots":["09:00 - 10:00","10:00 - 11:00"]}}
     */
    public function up(): void
    {
        Schema::create('doctor_schedules', function (Blueprint $table) {
            // PK aynı zamanda FK — her kaydın bir schedule'ı var
            $table->uuid('doctor_registration_id')->primary();
            $table->foreign('doctor_registration_id')
                  ->references('id')
                  ->on('doctor_registrations')
                  ->onDelete('cascade');

            $table->json('schedule');              // Haftalık çalışma planı (JSONB)
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};
