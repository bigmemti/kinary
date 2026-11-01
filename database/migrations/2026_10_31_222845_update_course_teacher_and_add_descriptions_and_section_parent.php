<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_teacher', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->text('description')->nullable();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->text('description')->nullable();
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->constrained('sections');
        });
    }

    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        Schema::table('course_teacher', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->foreign('course_id')->references('id')->on('courses');
        });
    }
};
