<?php

use App\Models\Attempt;
use App\Models\Space;
use App\Models\Student;
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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Attempt::class)->constrained();
            $table->foreignIdFor(Space::class)->constrained();
            $table->foreignIdFor(Student::class)->constrained();
            $table->timestamps();

            
            $table->unique(['space_id', 'student_id'], 'SSI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
