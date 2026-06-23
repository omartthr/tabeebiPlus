<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Destek talepleri tablosu — Hasta oluşturur, admin yanıtlar.
     * status: open → in_progress → resolved → closed
     * last_response: Adminin son verdiği yanıt
     */
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->uuid('patient_id')->nullable();
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');

            $table->string('category')->nullable();    // Talep kategorisi
            $table->string('subject');
            $table->text('message');
            $table->string('status')->default('open'); // open|in_progress|resolved|closed
            $table->text('last_response')->nullable(); // Son admin yanıtı

            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
