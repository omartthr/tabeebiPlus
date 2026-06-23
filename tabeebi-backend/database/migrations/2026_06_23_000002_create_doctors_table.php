<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Doktor tablosu — Onaylanmış doktorlar (Mobil'de listelenir).
     * Doktor başvuruları → doctor_registrations tablosundan gelir.
     * Admin onayladıkça bu tabloya kopyalanır.
     */
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('name');
            $table->string('specialty');
            $table->string('initials', 10);
            $table->integer('hue')->default(200);
            $table->decimal('rating', 3, 1)->nullable();
            $table->integer('reviews')->default(0);
            $table->string('price');              // IQD cinsinden (örn: "35000")
            $table->string('loc');                // Kısa konum (örn: "Kirkuk")
            $table->string('exp');                // Deneyim (örn: "9 yrs")
            $table->boolean('today')->default(false);
            $table->boolean('is_active')->default(true);
            $table->uuid('registration_id')->nullable(); // doctor_registrations.id
            $table->text('location_address')->nullable();
            $table->double('location_lat')->nullable();
            $table->double('location_lng')->nullable();
            $table->json('schedule')->nullable();  // {"mon":{"isOpen":true,"slots":[...]}}
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
