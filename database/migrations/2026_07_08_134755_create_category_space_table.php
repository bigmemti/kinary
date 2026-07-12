<?php

use App\Models\Category;
use App\Models\Space;
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
        Schema::create('category_space', function (Blueprint $table) {
            $table->foreignIdFor(Category::class)->constrained();
            $table->foreignIdFor(Space::class)->constrained();
            $table->timestamps();

            $table->unique(['category_id', 'space_id'], 'CSI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_space');
    }
};
