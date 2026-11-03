import { MarkdownContent } from '@/components/markdown-content';
import {
    CourseCard,
    EmptyState,
    persianNumber,
    Storefront,
    type PublicCourse,
} from '@/components/storefront';
import { show } from '@/routes/category';
import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';

interface CategoryPageProps {
    category: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
    };
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

export default function CategoryPage({
    category,
    courses,
    search,
}: CategoryPageProps) {
    return (
        <Storefront
            title={`دوره‌های ${category.name}`}
            description={`دوره‌های دسته‌بندی ${category.name} را در آکادمی ببینید.`}
        >
            <section className="mx-auto min-h-[65vh] max-w-7xl px-5 py-14 lg:px-10">
                <p className="storefront-eyebrow">دسته‌بندی آموزش‌ها</p>
                <h1 className="storefront-heading">دوره‌های {category.name}</h1>
                {category.description && (
                    <MarkdownContent className="mt-5 max-w-3xl leading-8 opacity-80">{category.description}</MarkdownContent>
                )}
                <Form
                    action={show(category.slug).url}
                    method="get"
                    className="my-8 flex max-w-2xl flex-wrap gap-3"
                    options={{ preserveState: false }}
                >
                    {({ processing }) => (
                        <>
                            <label
                                htmlFor="category-search"
                                className="sr-only"
                            >
                                جستجوی دوره‌ها در این دسته‌بندی
                            </label>
                            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-current/20 bg-white px-4 dark:bg-white/5">
                                <Search
                                    className="size-5 shrink-0 opacity-50"
                                    aria-hidden="true"
                                />
                                <input
                                    key={search}
                                    id="category-search"
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
                            href={show(category.slug)}
                            className="underline underline-offset-4"
                        >
                            پاک کردن جستجو
                        </Link>
                    )}
                </div>
                {courses.data.length ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.data.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-8">
                        <EmptyState
                            title={
                                search
                                    ? 'دوره‌ای با این جستجو پیدا نشد'
                                    : 'هنوز دوره‌ای در این دسته‌بندی منتشر نشده است'
                            }
                        >
                            {search
                                ? 'عبارت دیگری را امتحان کنید یا جستجو را پاک کنید.'
                                : 'پس از انتشار دوره‌های این موضوع، آن‌ها را اینجا می‌بینید.'}
                        </EmptyState>
                    </div>
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
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
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
                                <ArrowLeft
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Link>
                        )}
                    </nav>
                )}
            </section>
        </Storefront>
    );
}
