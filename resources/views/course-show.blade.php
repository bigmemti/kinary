<x-layouts.web>
    <div class="dark:text-white">{{ $course->title }}:</div>
    @forelse ($course->plans as $plan)
        <div class="dark:text-white">
            <div>{{ $plan->name }}</div>
            <div>{{ $plan->price }}</div>
            <div>
                <a href="{{ route('plan.buy', ['plan' => $plan]) }}">buy</a>
            </div>
        </div>
    @empty
        
    @endforelse
</x-layouts.web>