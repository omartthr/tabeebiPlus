<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hasta tablosu — Mobil uygulama kullanıcıları.
     * Kimlik doğrulama: Telefon + OTP (phone_otps tablosu)
     * API token'ları: personal_access_tokens (Sanctum)
     */
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('phone')->unique();
            $table->string('name');
            $table->integer('avatar_hue')->default(175);
            $table->string('patient_code')->nullable();   // Hasta takip kodu
            $table->boolean('is_registered')->default(false); // Geçici hasta mı?
            $table->text('push_token')->nullable();        // FCM push token
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
