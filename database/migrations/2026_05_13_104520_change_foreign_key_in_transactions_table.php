<?php

use App\Models\Order;
use App\Models\Plan;
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
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId(User::class);
            $table->dropConstrainedForeignId(Plan::class);
            $table->foreignIdFor(Order::class)->constrained();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId(Order::class);
            $table->foreignIdFor(User::class)->constrained();
            $table->foreignIdFor(Plan::class)->constrained();
        });
    }
};
