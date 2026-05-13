<?php

use App\Models\Student;
use App\Models\User;
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
        Schema::table('plan_user', function (Blueprint $table) {
            $table->dropForeign('plan_user_user_id_foreign'); 
            $table->dropForeign('plan_user_plan_id_foreign'); 
            $table->dropIndex('plan_user_user_id_foreign');
            $table->dropUnique('PUI');

            $table->dropForeignIdFor(User::class);
        });

        Schema::rename('plan_user', 'enrollments');

        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignIdFor(Student::class)->after('plan_id')->constrained();

            $table->foreign('plan_id')->references('id')->on('plans');

            $table->unique(['plan_id', 'student_id'], 'PSI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign('enrollments_student_id_foreign'); 
            $table->dropForeign('enrollments_plan_id_foreign'); 
            $table->dropIndex('enrollments_student_id_foreign');
            $table->dropUnique('PSI');

            $table->dropForeignIdFor(Student::class);

        });

        Schema::rename('enrollments', 'plan_user');

        Schema::table('plan_user', function (Blueprint $table) {
            $table->foreignIdFor(User::class)->after('plan_id')->constrained();

            $table->foreign('plan_id')->references('id')->on('plans');

            $table->unique(['plan_id', 'user_id'], 'PSI');
        });
    }
};
