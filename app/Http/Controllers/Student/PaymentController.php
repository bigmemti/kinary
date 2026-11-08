<?php

namespace App\Http\Controllers\Student;

use App\Enums\LedgerType;
use App\Enums\TransactionStatus;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Transaction;
use App\Services\ActivityLogger;
use App\Services\CartService;
use App\Services\PaymentService;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use UnexpectedValueException;

class PaymentController extends Controller
{
    public function buy(Request $request, Plan $plan, CartService $cart): RedirectResponse
    {
        $enrolled = $cart->select($request->user(), $plan);

        return to_route('course.show', $plan->space->course->slug)->with('cart_notice',
            $enrolled ? 'شرکت در دوره با موفقیت انجام شد.' : 'سبد خرید به‌روز شد.');
    }

    public function checkout(Request $request, PaymentService $service, CartService $cart): Response
    {
        try {
            $authority = DB::transaction(function () use ($request, $service, $cart): ?string {
                $user = $request->user();
                $wallet = $user->wallet()->lockForUpdate()->firstOrFail();
                $order = $cart->active($user);
                if (! $order) {
                    throw ValidationException::withMessages(['cart' => 'سبد خرید شما خالی است.']);
                }
                $cart->validate($user, $order);
                $shortfall = max(0, $order->amount - $wallet->balance);
                if ($shortfall === 0) {
                    $cart->purchase($user, $wallet, $order);

                    return null;
                }
                if (! $user->phone) {
                    throw ValidationException::withMessages(['cart' => 'برای پرداخت، ابتدا شماره موبایل خود را در پروفایل ثبت کنید.']);
                }
                $pending = $wallet->transactions()->where('status', TransactionStatus::Pending)
                    ->where('amount', $shortfall)->where('gateway', 'zarinpal')->latest('id')->first();
                if ($pending) {
                    return $pending->authority;
                }
                $authority = $service->request([
                    'amount' => $shortfall,
                    'description' => 'افزایش موجودی کیف پول آکادمی',
                    'metadata' => ['mobile' => $user->phone],
                ]);
                $wallet->transactions()->create([
                    'authority' => $authority,
                    'amount' => $shortfall,
                    'gateway' => 'zarinpal',
                    'status' => TransactionStatus::Pending,
                ]);

                return $authority;
            });
        } catch (GuzzleException|UnexpectedValueException $exception) {
            report($exception);

            return to_route('cart.index')->withErrors(['cart' => 'ارتباط با درگاه برقرار نشد. دوباره تلاش کنید.']);
        }

        return $authority === null
            ? to_route('dashboard')->with('cart_notice', 'خرید از موجودی کیف پول انجام شد و دسترسی شما فعال شد.')
            : Inertia::location($service->getPage($authority));
    }

    public function callback(Request $request, PaymentService $service, CartService $cart): RedirectResponse
    {
        $result = DB::transaction(function () use ($request, $service, $cart): string {
            $user = $request->user();
            $wallet = $user->wallet()->lockForUpdate()->firstOrFail();
            $transaction = Transaction::query()->where('wallet_id', $user->wallet->id)
                ->where('authority', $request->query('Authority'))
                ->lockForUpdate()->first();
            if (! $transaction) {
                return 'failed';
            }
            if ($transaction->status === TransactionStatus::Paid) {
                return 'already_paid';
            }
            if ($transaction->status !== TransactionStatus::Pending) {
                return 'failed';
            }
            try {
                $success = $request->query('Status') === 'OK'
                    && $service->verify((int) $transaction->amount, $transaction->authority);
            } catch (GuzzleException|UnexpectedValueException $exception) {
                report($exception);

                return 'failed';
            }
            $transaction->update($success
                ? ['status' => TransactionStatus::Paid, 'paid_at' => now()]
                : ['status' => TransactionStatus::Failed]);
            if (! $success) {
                return 'failed';
            }
            $ledger = $wallet->ledgers()->create(['amount' => $transaction->amount, 'type' => LedgerType::Deposit]);
            $wallet->balance += $transaction->amount;
            $wallet->save();
            $transaction->ledger()->associate($ledger);
            $transaction->save();

            $order = $cart->active($user);
            if (! $order) {
                return 'deposited';
            }
            try {
                $cart->validate($user, $order);
            } catch (ValidationException|NotFoundHttpException) {
                return 'deposited';
            }
            if ($wallet->balance < $order->amount) {
                return 'deposited';
            }
            $cart->purchase($user, $wallet, $order);

            return 'purchased';
        });

        app(ActivityLogger::class)->record('payment.callback', $result === 'failed' ? 'failure' : 'success', ['result' => $result]);

        return match ($result) {
            'purchased' => to_route('dashboard')->with('cart_notice', 'پرداخت موفق بود و دسترسی شما فعال شد.'),
            'already_paid' => to_route('dashboard')->with('cart_notice', 'این تراکنش قبلاً تأیید شده است.'),
            'deposited' => to_route('cart.index')->with('cart_notice', 'مبلغ پرداختی به کیف پول اضافه شد. برای تکمیل خرید، سبد خرید را بررسی کنید.'),
            default => to_route('cart.index')->withErrors(['cart' => 'پرداخت تأیید نشد. در صورت کسر وجه، پیش از پرداخت دوباره وضعیت تراکنش را پیگیری کنید.']),
        };
    }
}
