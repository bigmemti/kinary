<x-layouts.web>
    <div class="flex gap-2 ">
        @forelse ($courses as $course)
            <div class="dark:text-white border p-4 space-y-2">
                <img src="{{ $course->thumbnail }}" class="w-80 aspect-video" alt="">
                <div class="text-end">{{ $course->title }}</div>
                <div class="text-center">
                    <a class="border p-2 px-8 bg-teal-800" href="{{ route('course.show', ['course' => $course]) }}">show</a>
                </div>
            </div>
        @empty
            
        @endforelse
    </div>
</x-layouts.web>
