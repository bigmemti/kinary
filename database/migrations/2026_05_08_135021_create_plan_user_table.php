<?php

use App\Models\Plan;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plan_user', function (Blueprint $table) {
            $table->foreignIdFor(Plan::class)->constrained();
            $table->foreignIdFor(User::class)->constrained();
            $table->timestamps();

            $table->unique(['plan_id', 'user_id'], 'PUI');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_user');
    }
};
