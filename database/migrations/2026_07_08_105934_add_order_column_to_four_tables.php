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
        Schema::table('plans', function (Blueprint $table) {
            $table->smallInteger('order')->after('price');
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->smallInteger('order')->after('name');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->smallInteger('order')->after('name');
        });

        Schema::table('contents', function (Blueprint $table) {
            $table->smallInteger('order')->after('body');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('order');
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->dropColumn('order');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn('order');
        });

        Schema::table('contents', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }
};
