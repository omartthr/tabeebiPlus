<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Doktor başvuruları tablosu — Web panel üzerinden kayıt yapanlar.
     * status: pending → approved → doctors tablosuna kopyalanır.
     * doctors_id: Onaylandığında doctors.id ile eşleşir.
     * Kimlik doğrulama: Telefon + OTP (phone_otps tablosu)
     */
    public function up(): void
    {
        Schema::create('doctor_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('phone')->unique();
            $table->string('name');
            $table->string('surname');
            $table->string('specialty');
            $table->string('clinic_name')->nullable();
            $table->text('location_address')->nullable();
            $table->double('location_lat')->nullable();
            $table->double('location_lng')->nullable();
            $table->string('status')->default('pending'); // pending | approved | rejected
            $table->string('price')->nullable();           // Ücret (IQD)
            $table->integer('exp_years')->nullable();      // Deneyim yılı
            $table->uuid('doctors_id')->nullable();        // Onaylandığında doctors.id
            $table->date('birth_date')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('approved_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_registrations');
    }
};
