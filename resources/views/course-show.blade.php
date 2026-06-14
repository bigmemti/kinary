<x-layouts.web>
    <div class="flex flex-col gap-2 items-end">
        <div class="dark:text-white">{{ $course->title }}</div>
        <div class="dark:text-white">{{ $course->teacher->user->name }}:</div>
        <div class="w-full self-stretch flex justify-around py-4">
            @forelse ($course->plans as $plan)
                <div class="dark:text-white border bg-teal-800 p-10 rounded-xl flex flex-col items-end gap-4 py-16">
                    <div>{{ $plan->name }}</div>
                    <div>{{ $plan->price }}</div>
                    <div>
                        <a class="border px-8 p-2" href="{{ route('plan.buy', ['plan' => $plan]) }}">buy</a>
                    </div>
                </div>
            @empty
                
            @endforelse
        </div>
    </div>
</x-layouts.web>