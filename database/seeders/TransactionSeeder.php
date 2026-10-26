<?php

namespace Database\Seeders;

use App\Enums\LedgerType;
use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        Wallet::query()->each(function (Wallet $wallet): void {
            DB::transaction(function () use ($wallet): void {
                $wallet = Wallet::query()->lockForUpdate()->findOrFail($wallet->id);
                foreach (TransactionStatus::cases() as $status) {
                    $amount = fake()->numberBetween(10, 50) * 10000;
                    $ledger = null;
                    if ($status === TransactionStatus::Paid) {
                        $ledger = $wallet->ledgers()->create(['amount' => $amount, 'type' => LedgerType::Deposit]);
                        $wallet->balance += $amount;
                        $wallet->save();
                    }
                    Transaction::factory()->for($wallet)->create([
                        'amount' => $amount,
                        'status' => $status,
                        'ledger_id' => $ledger?->id,
                        'paid_at' => $status === TransactionStatus::Paid ? now() : null,
                    ]);
                }
            });
        });
    }
}
