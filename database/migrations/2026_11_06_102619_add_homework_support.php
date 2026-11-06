<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            $table->json('allowed_extensions')->nullable();
        });
        Schema::table('accesses', function (Blueprint $table): void {
            $table->string('answer_release')->default('submitted');
        });
        Schema::table('submissions', function (Blueprint $table): void {
            $table->timestamp('approved_at')->nullable();
        });
        Schema::create('submission_files', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('submission_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_files');
        Schema::table('submissions', fn (Blueprint $table) => $table->dropColumn('approved_at'));
        Schema::table('accesses', fn (Blueprint $table) => $table->dropColumn('answer_release'));
        Schema::table('assignments', fn (Blueprint $table) => $table->dropColumn('allowed_extensions'));
    }
};
