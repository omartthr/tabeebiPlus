<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bildirimler tablosu — Sistem/admin tarafından hastalara gönderilir.
     * type: reminder (hatırlatma), result (yeni sonuç),
     *       confirm (randevu onayı), block (bloke uyarısı)
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->uuid('patient_id')->nullable();
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');

            $table->string('type')->default('reminder'); // reminder|result|confirm|block
            $table->string('title');
            $table->text('body');
            $table->boolean('unread')->default(true);
            $table->string('time');                // "2h ago", "Yesterday" gibi gösterim metni

            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
