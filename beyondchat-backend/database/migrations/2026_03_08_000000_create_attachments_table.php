<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('email_id')
                ->constrained('emails')
                ->cascadeOnDelete();

            $table->string('filename');
            $table->string('mime_type')->nullable();
            $table->string('attachment_id');
            $table->integer('size')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};