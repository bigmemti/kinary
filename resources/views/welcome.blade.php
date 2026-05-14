<x-layouts.web>
    @forelse ($courses as $course)
        <div class="dark:text-white">
            <div>{{ $course->title }}</div>
            <div>
                <a href="{{ route('course.show', ['course' => $course]) }}">show</a>
            </div>
        </div>
    @empty
        
    @endforelse
</x-layouts.web>
