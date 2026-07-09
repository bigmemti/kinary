<?php

use App\Models\Ledger;
use App\Models\Order;
use App\Models\Wallet;
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
            $table->dropConstrainedForeignIdFor(Order::class);
            $table->foreignIdFor(Wallet::class)->after('id')->constrained();
            $table->foreignIdFor(Ledger::class)->after('wallet_id')->constrained();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignIdFor(Wallet::class)->constrained();
            $table->foreignIdFor(Ledger::class)->constrained();
            $table->foreignIdFor(Order::class)->after('id')->constrained();
        });
    }
};
