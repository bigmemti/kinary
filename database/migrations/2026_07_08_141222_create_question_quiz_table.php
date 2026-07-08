<?php

use App\Models\Question;
use App\Models\Quiz;
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
        Schema::create('question_quiz', function (Blueprint $table) {
            $table->foreignIdFor(Question::class)->constrained();
            $table->foreignIdFor(Quiz::class)->constrained();
            $table->smallInteger('order');
            $table->timestamps();

            
            $table->unique(['question_id', 'quiz_id'], 'QQI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_quiz');
    }
};
