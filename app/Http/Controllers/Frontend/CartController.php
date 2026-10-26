<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request, CartService $cart): Response
    {
        $items = $cart->items($request->user());
        $total = array_sum(array_column($items, 'price'));
        $balance = $request->user()->wallet->balance;

        return Inertia::render('course/cart', [
            'items' => $items,
            'total' => $total,
            'balance' => $balance,
            'payableAmount' => max(0, $total - $balance),
            'canonicalUrl' => route('cart.index'),
        ])->withViewData([
            'storefrontTitle' => 'سبد خرید | آکادمی',
            'storefrontDescription' => 'مرور پلن‌های انتخاب‌شده و پرداخت سفارش در آکادمی.',
        ]);
    }

    public function destroy(Request $request, Plan $plan, CartService $cart): RedirectResponse
    {
        $cart->remove($request->user(), $plan);

        return back()->with('cart_notice', 'پلن از سبد خرید حذف شد.');
    }
}
