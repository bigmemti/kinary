<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Wallet::getInRandomOrder(rand(5, 8))->each(fn ($wallet) => Order::factory(rand(3, 5))->for($wallet)->create());
    }
}
