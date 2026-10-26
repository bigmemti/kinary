import {
    CourseCard,
    EmptyState,
    persianNumber,
    Storefront,
    type PublicCourse,
} from '@/components/storefront';
import { index } from '@/routes/course';
import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';

interface CatalogProps {
    search: string;
    courses: {
        data: PublicCourse[];
        total: number;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

export default function Catalog({ courses, search }: CatalogProps) {
    return (
        <Storefront
            title="همه دوره‌ها"
            description="دوره‌های آکادمی را ببینید و با جستجوی عنوان یا موضوع، آموزش موردنظرتان را پیدا کنید."
        >
            <section className="mx-auto min-h-[65vh] max-w-7xl px-5 py-14 lg:px-10">
                <p className="storefront-eyebrow">
                    مسیر یادگیری خودت را پیدا کن
                </p>
                <h1 className="storefront-heading">همه دوره‌ها</h1>
                <p className="mt-4 text-sm leading-8 opacity-70">
                    عنوان یا موضوع موردنظرت را جستجو کن و دوره‌ها را بشناس.
                </p>
                <Form
                    action={index().url}
                    method="get"
                    className="my-8 flex max-w-2xl flex-wrap gap-3"
                    options={{ preserveState: false }}
                >
                    {({ processing }) => (
                        <>
                            <label htmlFor="course-search" className="sr-only">
                                جستجوی دوره‌ها
                            </label>
                            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-current/20 bg-white px-4 dark:bg-white/5">
                                <Search
                                    className="size-5 shrink-0 opacity-50"
                                    aria-hidden="true"
                                />
                                <input
                                    key={search}
                                    id="course-search"
                                    name="search"
                                    type="search"
                                    maxLength={150}
                                    defaultValue={search}
                                    placeholder="عنوان یا موضوع دوره…"
                                    className="min-w-0 flex-1 bg-transparent py-4 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="storefront-button disabled:opacity-50"
                            >
                                {processing ? 'در حال جستجو…' : 'جستجو'}
                            </button>
                        </>
                    )}
                </Form>
                <div className="mb-6 flex flex-wrap gap-4 text-sm">
                    <p aria-live="polite">
                        {persianNumber(courses.total)} دوره
                        {search && ` برای «${search}»`}
                    </p>
                    {search && (
                        <Link
                            href={index()}
                            className="underline underline-offset-4"
                        >
                            پاک کردن جستجو
                        </Link>
                    )}
                </div>
                {courses.data.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.data.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title={
                            search
                                ? 'دوره‌ای با این جستجو پیدا نشد'
                                : 'هنوز دوره‌ای منتشر نشده است'
                        }
                    >
                        {search
                            ? 'عبارت دیگری را امتحان کنید یا جستجو را پاک کنید.'
                            : 'دوره‌های منتشرشده در این صفحه در دسترس خواهند بود.'}
                    </EmptyState>
                )}
                {courses.last_page > 1 && (
                    <nav
                        aria-label="صفحه‌بندی دوره‌ها"
                        className="mt-10 flex flex-wrap items-center justify-center gap-5"
                    >
                        {courses.prev_page_url && (
                            <Link
                                href={courses.prev_page_url}
                                className="flex items-center gap-2 rounded-xl border px-4 py-3"
                            >
                                <ArrowRight className="size-4" />
                                صفحه قبل
                            </Link>
                        )}
                        <span className="text-sm">
                            صفحه {persianNumber(courses.current_page)} از{' '}
                            {persianNumber(courses.last_page)}
                        </span>
                        {courses.next_page_url && (
                            <Link
                                href={courses.next_page_url}
                                className="flex items-center gap-2 rounded-xl border px-4 py-3"
                            >
                                صفحه بعد
                                <ArrowLeft className="size-4" />
                            </Link>
                        )}
                    </nav>
                )}
            </section>
        </Storefront>
    );
}
