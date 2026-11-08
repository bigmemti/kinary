<?php

namespace App\Http\Middleware;

use App\Services\CartService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user()?->load(['wallet']),
                'roles' => fn (): array => $request->user()?->getRoleNames()->values()->all() ?? [],
                'permissions' => fn (): array => $request->user()?->getAllPermissions()->pluck('name')->unique()->values()->all() ?? [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'pageDirection' => $request->routeIs('home', 'course.*', 'category.*', 'cart.*', 'community.*', 'login', 'register') ? 'rtl' : 'ltr',
            'cartNotice' => fn (): ?string => $request->session()->get('cart_notice'),
            'storefrontCart' => fn (): array => $request->user() && $request->routeIs('home', 'course.*', 'category.*', 'cart.*', 'community.*', 'login', 'register')
                ? app(CartService::class)->items($request->user())
                : [],
        ];
    }

    public function handle(
        Request $request,
        \Closure $next
    ) {
        config([
            'inertia.ssr.enabled' => ! Vite::isRunningHot() && $request->routeIs(
                'home',
                'cart.index',
                'course.index',
                'course.show',
                'category.show',
                'community.show',
                'login',
                'register',
            ),
        ]);

        return parent::handle($request, $next);
    }
}
