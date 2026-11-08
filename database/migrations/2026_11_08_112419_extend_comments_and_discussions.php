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
        Schema::table('comments', function (Blueprint $table): void {
            $table->unsignedBigInteger('replay_id')->nullable()->change();
            $table->string('commentable_type')->nullable()->change();
            $table->unsignedBigInteger('commentable_id')->nullable()->change();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('visible')->index();
        });

        Schema::table('discussions', function (Blueprint $table): void {
            $table->string('discussionable_type')->nullable()->change();
            $table->unsignedBigInteger('discussionable_id')->nullable()->change();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('source_comment_id')->nullable()->unique()->constrained('comments')->nullOnDelete();
            $table->text('body')->nullable();
        });

        Schema::create('discussion_plan', function (Blueprint $table): void {
            $table->foreignId('discussion_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->primary(['discussion_id', 'plan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discussion_plan');
        Schema::table('discussions', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('source_comment_id');
            $table->dropConstrainedForeignId('lesson_id');
            $table->dropConstrainedForeignId('course_id');
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('body');
        });
        Schema::table('comments', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('status');
        });
    }
};
