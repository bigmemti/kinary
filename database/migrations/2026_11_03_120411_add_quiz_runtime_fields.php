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
        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreignId('space_id')->nullable()->constrained();
            $table->string('title')->default('آزمون');
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_seconds')->default(600);
            $table->decimal('correct_score', 8, 2)->default(1);
            $table->decimal('wrong_penalty', 8, 2)->default(0);
            $table->decimal('passing_score', 8, 2)->nullable();
            $table->unsignedInteger('guest_attempt_limit')->default(3);
        });

        Schema::create('plan_quiz', function (Blueprint $table) {
            $table->foreignId('plan_id')->constrained();
            $table->foreignId('quiz_id')->constrained();
            $table->unsignedInteger('attempt_limit')->nullable();
            $table->primary(['plan_id', 'quiz_id']);
        });

        Schema::table('attempts', function (Blueprint $table) {
            $table->decimal('score', 10, 2)->nullable()->change();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('finished_at')->nullable();
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->uuid('certificate_token')->nullable()->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropUnique(['certificate_token']);
            $table->dropColumn('certificate_token');
        });
        Schema::table('attempts', function (Blueprint $table) {
            $table->dropColumn(['started_at', 'expires_at', 'finished_at']);
            $table->smallInteger('score')->nullable(false)->change();
        });
        Schema::dropIfExists('plan_quiz');
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('space_id');
            $table->dropColumn(['title', 'description', 'duration_seconds', 'correct_score', 'wrong_penalty', 'passing_score', 'guest_attempt_limit']);
        });
    }
};
