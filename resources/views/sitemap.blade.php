{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ url('/') }}</loc>
    </url>

    <url>
        <loc>{{ route('course.index') }}</loc>
    </url>

    @foreach ($courses as $course)
        <url>
            <loc>{{ route('course.show', ['course' => $course->slug]) }}</loc>

            @if ($course->updated_at)
                <lastmod>{{ $course->updated_at->toAtomString() }}</lastmod>
            @endif
        </url>
    @endforeach
</urlset>
