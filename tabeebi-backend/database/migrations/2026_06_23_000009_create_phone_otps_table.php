<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * OTP kodları tablosu — Geçici SMS doğrulama kodları.
     * PK: phone (her telefonun tek bir aktif OTP'si olabilir).
     * expires_at: Kodun geçerlilik süresi (genellikle 5-10 dakika).
     * Başarılı doğrulamadan sonra satır silinir.
     */
    public function up(): void
    {
        Schema::create('phone_otps', function (Blueprint $table) {
            $table->string('phone')->primary();     // Tek aktif OTP per numara
            $table->string('otp', 10);              // 4-6 haneli kod
            $table->timestampTz('expires_at');      // Geçerlilik bitiş zamanı
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_otps');
    }
};
