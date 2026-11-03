import { MarkdownContent } from '@/components/markdown-content';
import {
    CourseCard,
    EmptyState,
    Storefront,
    type PublicCourse,
} from '@/components/storefront';

export default function TeacherPage({
    teacher,
    courses,
}: {
    teacher: { name: string; description: string | null };
    courses: PublicCourse[];
}) {
    return (
        <Storefront
            title={teacher.name}
            description={
                teacher.description || `دوره‌های ${teacher.name} در آکادمی`
            }
        >
            <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-14 lg:px-10">
                <p className="storefront-eyebrow">مدرس آکادمی</p>
                <h1 className="storefront-heading">{teacher.name}</h1>
                {teacher.description && (
                    <MarkdownContent className="mt-5 max-w-3xl leading-8 opacity-80">{teacher.description}</MarkdownContent>
                )}
                <h2 className="mt-12 text-2xl font-bold">دوره‌های مدرس</h2>
                {courses.length ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <EmptyState title="هنوز دوره‌ای منتشر نشده است">
                        دوره‌های منتشرشده اینجا نمایش داده می‌شوند.
                    </EmptyState>
                )}
            </main>
        </Storefront>
    );
}
