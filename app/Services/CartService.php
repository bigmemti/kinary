<?php

namespace App\Services;

use App\Enums\LedgerType;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function active(User $user): ?Order
    {
        return $user->wallet->orders()->where('status', 'pending')
            ->where('updated_at', '>=', now()->subDay())->orderBy('id')->first();
    }

    public function enrolledPlan(User $user, int $spaceId): ?Plan
    {
        return $user->student?->plans()->wherePivot('is_active', true)
            ->where('space_id', $spaceId)->orderByDesc('order')->orderByDesc('plans.id')->first();
    }

    public function price(User $user, Plan $plan): int
    {
        $current = $this->enrolledPlan($user, $plan->space_id);

        return max(0, $plan->price - ($current?->price ?? 0));
    }

    public function assertSelectable(User $user, Plan $plan): void
    {
        abort_unless($plan->space?->course?->is_published, 404);
        $current = $this->enrolledPlan($user, $plan->space_id);
        if ($current && $plan->order <= $current->order) {
            throw ValidationException::withMessages(['cart' => 'این پلن یا پلنی بالاتر از آن را دارید. فقط ارتقا به پلن بالاتر امکان‌پذیر است.']);
        }
    }

    public function select(User $user, Plan $plan): bool
    {
        return DB::transaction(function () use ($user, $plan): bool {
            $user->wallet()->lockForUpdate()->firstOrFail();
            $this->assertSelectable($user, $plan);
            $order = $this->active($user);
            $price = $this->price($user, $plan);

            if ($price === 0) {
                $logger = app(ActivityLogger::class);
                $beforeEnrollment = $logger->snapshot('enrollments', ['student_id' => $user->student->id], ['plan_id', 'is_active']);
                $user->student->plans()->syncWithoutDetaching([$plan->id => ['is_active' => true]]);
                $logger->recordChanges('enrollment.plans.changed', $beforeEnrollment, $logger->snapshot('enrollments', ['student_id' => $user->student->id], ['plan_id', 'is_active']), $user->student);
                app(ActivityLogger::class)->record('enrollment.activated', properties: ['student_id' => $user->student->id, 'plan_id' => $plan->id]);
                if ($order) {
                    $beforeCart = $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']);
                    $this->removeSpace($order, $plan->space_id);
                    $this->updateTotal($order);
                    $logger->recordChanges('cart.items.changed', $beforeCart, $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']), $order);
                }

                return true;
            }

            if (! $order) {
                $order = $user->wallet->orders()->make();
                $order->amount = 0;
                $order->save();
            }
            $logger = app(ActivityLogger::class);
            $before = $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']);
            $this->removeSpace($order, $plan->space_id);
            $order->plans()->attach($plan->id, ['price' => $price]);
            $this->updateTotal($order);
            $logger->recordChanges('cart.items.changed', $before, $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']), $order);

            return false;
        });
    }

    public function remove(User $user, Plan $plan): void
    {
        DB::transaction(function () use ($user, $plan): void {
            $user->wallet()->lockForUpdate()->firstOrFail();
            $order = $this->active($user);
            if (! $order) {
                return;
            }
            $logger = app(ActivityLogger::class);
            $before = $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']);
            $order->plans()->detach($plan->id);
            $this->updateTotal($order);
            $logger->recordChanges('cart.items.changed', $before, $logger->snapshot('order_plan', ['order_id' => $order->id], ['plan_id', 'price']), $order);
        });
    }

    private function removeSpace(Order $order, int $spaceId): void
    {
        $ids = $order->plans()->where('space_id', $spaceId)->pluck('plans.id');
        $order->plans()->detach($ids);
    }

    public function updateTotal(Order $order): void
    {
        $order->amount = (int) $order->plans()->sum('order_plan.price');
        $order->save();
    }

    public function validate(User $user, Order $order): void
    {
        $plans = $order->plans()->with('space.course')->get();
        if ($plans->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'سبد خرید شما خالی است.']);
        }
        if ($plans->pluck('space_id')->unique()->count() !== $plans->count()) {
            throw ValidationException::withMessages(['cart' => 'از هر فضای آموزشی فقط یک پلن انتخاب کنید.']);
        }
        foreach ($plans as $plan) {
            $this->assertSelectable($user, $plan);
            if ($this->price($user, $plan) !== (int) $plan->pivot->price) {
                throw ValidationException::withMessages(['cart' => 'قیمت یا دسترسی پلن تغییر کرده است. پلن را حذف و دوباره انتخاب کنید.']);
            }
        }
        $this->updateTotal($order);
        if ($order->amount <= 0) {
            throw ValidationException::withMessages(['cart' => 'برای پلن رایگان از دکمه شرکت در دوره استفاده کنید.']);
        }
    }

    /** The caller must hold the wallet row lock inside a database transaction. */
    public function purchase(User $user, Wallet $wallet, Order $order): void
    {
        if ($wallet->balance < $order->amount) {
            throw ValidationException::withMessages(['cart' => 'موجودی کیف پول برای خرید کافی نیست.']);
        }
        $wallet->ledgers()->create(['amount' => $order->amount, 'type' => LedgerType::Payment]);
        $wallet->balance -= $order->amount;
        $wallet->save();
        $order->update(['status' => 'paid']);
        $logger = app(ActivityLogger::class);
        $beforeEnrollment = $logger->snapshot('enrollments', ['student_id' => $user->student->id], ['plan_id', 'is_active']);
        $planIds = $order->plans()->pluck('plans.id')->all();
        $user->student->plans()->syncWithoutDetaching(
            collect($planIds)->mapWithKeys(fn ($id): array => [$id => ['is_active' => true]])->all()
        );
        $logger->recordChanges('enrollment.plans.changed', $beforeEnrollment, $logger->snapshot('enrollments', ['student_id' => $user->student->id], ['plan_id', 'is_active']), $user->student);
        app(ActivityLogger::class)->record('order.purchased', properties: ['order_id' => $order->id, 'student_id' => $user->student->id, 'plan_ids' => $planIds, 'amount' => $order->amount]);
    }

    /** @return list<array{id: int, spaceId: int, name: string, spaceName: string, courseTitle: string, courseSlug: ?string, price: int}> */
    public function items(User $user): array
    {
        return $this->active($user)?->plans()->with('space.course')->get()
            ->map(fn (Plan $plan): array => [
                'id' => $plan->id,
                'spaceId' => $plan->space_id,
                'name' => $plan->name,
                'spaceName' => $plan->space->name,
                'courseTitle' => $plan->space->course?->title ?? 'دوره در دسترس نیست',
                'courseSlug' => $plan->space->course?->slug,
                'price' => (int) $plan->pivot->price,
            ])->all() ?? [];
    }
}
