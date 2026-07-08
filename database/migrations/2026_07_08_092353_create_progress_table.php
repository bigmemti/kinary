<?php

use App\Models\Content;
use App\Models\Enrollment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('progress', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Content::class)->constrained();
            $table->foreignIdFor(Enrollment::class)->constrained();
            $table->enum('status', ['unread', 'read', 'cloned'])->default('unread');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->unique(['content_id', 'enrollment_id'], 'CEI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress');
    }
};
