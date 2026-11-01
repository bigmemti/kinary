<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique();
        });

        DB::table('categories')->orderBy('id')->chunkById(100, function ($categories): void {
            foreach ($categories as $category) {
                $base = trim(preg_replace('/[^\pL\pN]+/u', '-', mb_strtolower($category->name)), '-');
                $base = mb_substr($base !== '' ? $base : 'category', 0, 200);
                $base = rtrim($base, '-');
                $slug = $base;
                $suffix = 2;
                while (DB::table('categories')->where('slug', $slug)->exists()) {
                    $slug = $base.'-'.$suffix++;
                }
                DB::table('categories')->where('id', $category->id)->update(['slug' => $slug]);
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
