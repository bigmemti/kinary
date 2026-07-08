<?php

use App\Models\Access;
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
        Schema::create('requirements', function (Blueprint $table) {
            $table->foreignIdFor(Access::class)->constrained();
            $table->foreignIdFor(Space::class)->constrained();
            $table->smallInteger('score');
            $table->timestamps();
            
            $table->unique(['access_id', 'space_id'], 'ASI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requirements');
    }
};
