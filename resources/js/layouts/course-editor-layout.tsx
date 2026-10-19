import { Button } from '@/components/ui/button';
import { index } from '@/routes/teacher/course';
import type { CourseEditorCourse } from '@/types/course-editor';
import { Link } from '@inertiajs/react';
import { ArrowRight, PanelsTopLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export default function CourseEditorLayout({
    course,
    sidebar,
    status,
    children,
}: {
    course: CourseEditorCourse;
    sidebar: ReactNode;
    status: ReactNode;
    children: ReactNode;
}) {
    return (
        <div
            dir="rtl"
            className="flex h-dvh flex-col overflow-hidden bg-background text-foreground"
        >
            <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3 md:px-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <PanelsTopLeft className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                        ویرایشگر دوره
                    </p>
                    <h1 className="truncate font-semibold" title={course.title}>
                        {course.title}
                    </h1>
                </div>
                <span className="hidden rounded-full bg-muted px-3 py-1 text-xs sm:inline-flex">
                    {course.is_published ? 'منتشرشده' : 'پیش‌نویس'}
                </span>
                <div
                    className="max-w-32 text-xs text-muted-foreground sm:max-w-none"
                    role="status"
                    aria-live="polite"
                >
                    {status}
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href={index()}>
                        <ArrowRight aria-hidden="true" />
                        <span className="hidden sm:inline">
                            بازگشت به دوره‌ها
                        </span>
                        <span className="sm:hidden">دوره‌ها</span>
                    </Link>
                </Button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
                <aside
                    aria-label="تنظیمات دوره"
                    className="flex max-h-[50dvh] min-h-0 shrink-0 flex-col overflow-hidden border-b bg-card md:max-h-none md:w-80 md:border-b-0 md:border-l xl:w-96"
                >
                    {sidebar}
                </aside>
                <main
                    aria-label="فضای ساخت دوره"
                    scroll-region=""
                    className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-muted/30 p-5 md:p-10"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
