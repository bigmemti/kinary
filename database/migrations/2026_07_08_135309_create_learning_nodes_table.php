<?php

use App\Models\LearningPath;
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
        Schema::create('learning_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(LearningPath::class)->constrained();
            $table->foreignIdFor(Space::class)->constrained();
            $table->text('description');
            $table->smallInteger('order');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_nodes');
    }
};
