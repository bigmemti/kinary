<?php

use App\Models\Attempt;
use App\Models\Choice;
use App\Models\Question;
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
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Attempt::class)->constrained();
            $table->foreignIdFor(Choice::class)->constrained();
            $table->foreignIdFor(Question::class)->constrained();
            $table->timestamps();

            
            $table->unique(['attempt_id', 'question_id'], 'AQI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
