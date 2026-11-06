<?php

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
        Schema::table('assignments', function (Blueprint $table): void {
            $table->text('answer_body')->nullable();
            $table->string('answer_video_url', 2000)->nullable();
        });

        Schema::table('accesses', function (Blueprint $table): void {
            $table->string('answer_video_release')->default('never');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accesses', function (Blueprint $table): void {
            $table->dropColumn('answer_video_release');
        });
        Schema::table('assignments', function (Blueprint $table): void {
            $table->dropColumn(['answer_body', 'answer_video_url']);
        });
    }
};
