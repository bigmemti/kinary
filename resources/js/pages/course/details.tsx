import { MarkdownContent } from '@/components/markdown-content';
import PlanCard, { type PublicPlan } from '@/components/plan-card';
import { EmptyState, persianNumber, Storefront } from '@/components/storefront';
import { nestedSections, type NestedSection } from '@/lib/section-tree';
import { home } from '@/routes';
import { show as categoryShow } from '@/routes/category';
import { index } from '@/routes/course';
import { show as teacherShow } from '@/routes/teacher';
import { start as startQuiz } from '@/routes/student/quiz';
import { Link } from '@inertiajs/react';
import {
    ArrowDown,
    BookOpen,
    ChevronDown,
    GraduationCap,
    Info,
    Layers3,
} from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';

interface PublicLesson {
    id: number;
    name: string;
    contentsCount: number;
    planAccess: { planId: number; planName: string; contentsCount: number }[];
}

interface PublicSection {
    id: number;
    name: string;
    depth: number;
    lessons: PublicLesson[];
}

interface PublicSpace {
    id: number;
    name: string;
    quizId: number | null;
    categories: { id: number; name: string; slug: string }[];
    plans: PublicPlan[];
    sections: PublicSection[];
}

interface CoursePageProps {
    course: {
        id: number;
        title: string;
        slug: string;
        description: string | null;
        thumbnail: string | null;
        teachers: { id: number; name: string }[];
    };
    spaces: PublicSpace[];
}

export default function CourseDetails({ course, spaces }: CoursePageProps) {
    const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0]?.id);
    const [failedThumbnail, setFailedThumbnail] = useState(false);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const tabsId = useId();
    const selectedSpace =
        spaces.find((space) => space.id === selectedSpaceId) ?? spaces[0];

    function navigateTabs(
        event: KeyboardEvent<HTMLButtonElement>,
        currentIndex: number,
    ) {
        let nextIndex = currentIndex;
        if (event.key === 'ArrowLeft') {
            nextIndex = (currentIndex + 1) % spaces.length;
        } else if (event.key === 'ArrowRight') {
            nextIndex = (currentIndex - 1 + spaces.length) % spaces.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = spaces.length - 1;
        } else {
            return;
        }
        event.preventDefault();
        setSelectedSpaceId(spaces[nextIndex].id);
        tabRefs.current[nextIndex]?.focus();
    }

    return (
        <Storefront
            title={course.title}
            description={
                course.description?.slice(0, 160) ||
                `معرفی، سرفصل‌ها و پلن‌های دوره ${course.title} در آکادمی.`
            }
        >
            <section className="border-b border-current/10">
                <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
                    <nav
                        aria-label="مسیر صفحه"
                        className="mb-10 flex flex-wrap items-center gap-3 text-xs opacity-65"
                    >
                        <Link href={home()}>صفحه اصلی</Link>
                        <span aria-hidden="true">/</span>
                        <Link href={index()}>همه دوره‌ها</Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">{course.title}</span>
                    </nav>
                    <div className="grid items-start gap-10 pb-6 md:grid-cols-[1.2fr_1fr]">
                        <div>
                            <p className="storefront-eyebrow">
                                یک قدم تازه در مسیر مهندسی نرم‌افزار
                            </p>
                            <h1 className="text-3xl leading-[1.7] font-bold sm:text-4xl">
                                {course.title}
                            </h1>
                            <MarkdownContent className="mt-5 text-sm leading-9 opacity-80">
                                {course.description ||
                                    'توضیحات این دوره هنوز ثبت نشده است.'}
                            </MarkdownContent>
                            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-current/10 p-4">
                                <GraduationCap
                                    className="size-6 shrink-0 text-[#687943] dark:text-[#d9e3ad]"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="mb-2 text-xs opacity-60">
                                        {course.teachers.length > 1
                                            ? 'مدرسین دوره'
                                            : 'مدرس دوره'}
                                    </p>
                                    {course.teachers.length ? (
                                        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
                                            {course.teachers.map((teacher) => (
                                                <li key={teacher.id}>
                                                    <Link
                                                        href={teacherShow(
                                                            teacher.id,
                                                        )}
                                                        className="underline underline-offset-4"
                                                    >
                                                        {teacher.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm">
                                            مدرس دوره هنوز معرفی نشده است.
                                        </p>
                                    )}
                                </div>
                            </div>
                            {spaces.length > 0 && (
                                <a
                                    href="#course-learning"
                                    className="storefront-button mt-7 gap-3"
                                >
                                    سرفصل‌ها و پلن‌ها
                                    <ArrowDown
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </a>
                            )}
                        </div>
                        {course.thumbnail && !failedThumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={`تصویر دوره ${course.title}`}
                                onError={() => setFailedThumbnail(true)}
                                className="aspect-video w-full rounded-3xl border border-current/10 object-cover"
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                className="flex aspect-video flex-col items-center justify-center gap-6 rounded-3xl bg-[#244d40] p-8 text-[#d9e3ad]"
                            >
                                <BookOpen className="size-20" strokeWidth={1} />
                                <span className="text-lg font-bold">
                                    بفهم. تجربه کن. بساز.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <section
                id="course-learning"
                aria-label="فضاهای آموزشی دوره"
                className="mx-auto max-w-7xl px-5 py-12 lg:px-10"
            >
                {spaces.length > 1 && (
                    <>
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#8b9b5a]/35 bg-[#e7ebdf] p-5 text-sm leading-8 dark:bg-white/5">
                            <Info
                                className="mt-1 size-5 shrink-0"
                                aria-hidden="true"
                            />
                            <p>
                                این دوره چند فضای آموزشی دارد. ابتدا فضای
                                موردنظرتان را انتخاب کنید تا سرفصل‌ها و پلن‌های
                                مربوط به همان فضا را ببینید.
                            </p>
                        </div>
                        <div
                            role="tablist"
                            aria-label="انتخاب فضای آموزشی"
                            aria-orientation="horizontal"
                            className="mb-10 flex gap-3 overflow-x-auto rounded-2xl border border-current/10 p-2"
                        >
                            {spaces.map((space, position) => (
                                <button
                                    key={space.id}
                                    ref={(node) => {
                                        tabRefs.current[position] = node;
                                    }}
                                    type="button"
                                    role="tab"
                                    id={`${tabsId}-tab-${space.id}`}
                                    aria-controls={`${tabsId}-panel-${space.id}`}
                                    aria-selected={
                                        selectedSpace?.id === space.id
                                    }
                                    tabIndex={
                                        selectedSpace?.id === space.id ? 0 : -1
                                    }
                                    onClick={() => setSelectedSpaceId(space.id)}
                                    onKeyDown={(event) =>
                                        navigateTabs(event, position)
                                    }
                                    className={`shrink-0 rounded-xl px-6 py-3 text-sm transition ${selectedSpace?.id === space.id ? 'bg-[#244d40] font-bold text-white dark:bg-[#d9e3ad] dark:text-[#243b37]' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {space.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {selectedSpace ? (
                    <div
                        key={selectedSpace.id}
                        role={spaces.length > 1 ? 'tabpanel' : undefined}
                        id={`${tabsId}-panel-${selectedSpace.id}`}
                        aria-labelledby={
                            spaces.length > 1
                                ? `${tabsId}-tab-${selectedSpace.id}`
                                : undefined
                        }
                        tabIndex={spaces.length > 1 ? 0 : undefined}
                    >
                        {selectedSpace.quizId && <div className="mb-8 space-y-3"><h2 className="font-bold">آزمون پایانی</h2><Link method="post" as="button" className="storefront-button" href={startQuiz({ space: selectedSpace.id, quiz: selectedSpace.quizId })}>شرکت در آزمون پایانی</Link></div>}
                        {selectedSpace.categories.length > 0 && (
                            <nav
                                aria-label="دسته‌بندی‌های فضای آموزشی"
                                className="mb-8"
                            >
                                <p className="mb-3 text-sm font-bold">
                                    دسته‌بندی‌های این فضای آموزشی
                                </p>
                                <ul className="flex flex-wrap gap-2">
                                    {selectedSpace.categories.map(
                                        (category) => (
                                            <li key={category.id}>
                                                <Link
                                                    href={categoryShow(
                                                        category.slug,
                                                    )}
                                                    className="inline-block rounded-xl border border-current/20 px-4 py-2 text-sm leading-7 hover:bg-black/5 dark:hover:bg-white/5"
                                                >
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </nav>
                        )}
                        <div className="mb-8 flex items-start gap-3">
                            <BookOpen
                                className="mt-2 size-6 shrink-0 opacity-65"
                                aria-hidden="true"
                            />
                            <div>
                                <h2 className="storefront-heading">
                                    فهرست مطالب
                                </h2>
                                <p className="mt-3 text-sm leading-8 opacity-65">
                                    هر فصل را باز کنید تا درس‌ها و تعداد محتوای
                                    قابل دسترسی با هر پلن را ببینید.
                                </p>
                            </div>
                        </div>
                        {selectedSpace.sections.length ? (
                            <div className="grid gap-4">
                                {nestedSections(selectedSpace.sections).map(
                                    (section) => (
                                        <PublicSectionItem
                                            key={section.id}
                                            section={section}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <EmptyState title="سرفصل مرتبطی برای این فضا ثبت نشده است">
                                درس‌هایی که محتوای آن‌ها به پلن‌های این فضا
                                دسترسی دارد، در این بخش نمایش داده می‌شوند.
                            </EmptyState>
                        )}
                        <div className="mt-14 mb-8 flex items-start gap-3">
                            <Layers3
                                className="mt-2 size-6 shrink-0 opacity-65"
                                aria-hidden="true"
                            />
                            <div>
                                <h2 className="storefront-heading">
                                    پلن‌های آموزشی
                                </h2>
                                <p className="mt-3 text-sm leading-8 opacity-65">
                                    تعداد محتواها و درس‌های در دسترس هر پلن را
                                    مقایسه کنید.
                                </p>
                            </div>
                        </div>
                        {selectedSpace.plans.length ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {selectedSpace.plans.map((plan) => (
                                    <PlanCard key={plan.id} plan={plan} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="هنوز پلنی برای این فضا ثبت نشده است">
                                پس از تعریف پلن‌ها، نام، قیمت و دسترسی آن‌ها در
                                این بخش نمایش داده می‌شود.
                            </EmptyState>
                        )}
                    </div>
                ) : (
                    <EmptyState title="فضای آموزشی دوره هنوز آماده نشده است">
                        سرفصل‌ها و پلن‌های دوره پس از تعریف فضای آموزشی در این
                        بخش نمایش داده می‌شوند.
                    </EmptyState>
                )}
            </section>
        </Storefront>
    );
}

export function PublicSectionItem({
    section,
}: {
    section: NestedSection<PublicSection>;
}) {
    return (
        <details className="group overflow-hidden rounded-2xl border border-current/15 bg-white dark:bg-white/5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                <span className="font-bold">{section.name}</span>
                <span className="flex shrink-0 items-center gap-3 text-xs opacity-65">
                    {persianNumber(section.lessons.length)} درس
                    <ChevronDown
                        className="size-4 transition group-open:rotate-180"
                        aria-hidden="true"
                    />
                </span>
            </summary>
            <ul className="divide-y divide-current/10 border-t border-current/10">
                {section.lessons.map((lesson) => (
                    <li key={lesson.id} className="p-5 sm:px-7">
                        <h3 className="text-sm leading-7 font-bold">
                            {lesson.name}
                        </h3>
                        <p className="mt-2 text-xs leading-7 opacity-60">
                            {persianNumber(lesson.contentsCount)} محتوای مرتبط
                            با این فضا
                        </p>
                        <ul
                            aria-label={`دسترسی پلن‌ها به محتوای درس ${lesson.name}`}
                            className="mt-3 flex flex-wrap gap-2"
                        >
                            {lesson.planAccess.map((access) => (
                                <li
                                    key={access.planId}
                                    className="rounded-lg bg-[#e7ebdf] px-3 py-2 text-xs leading-6 dark:bg-white/10"
                                >
                                    {access.planName}:{' '}
                                    {persianNumber(access.contentsCount)} محتوای
                                    در دسترس
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
            {section.children.length > 0 && (
                <div className="space-y-3 px-4 pb-4">
                    {section.children.map((child) => (
                        <PublicSectionItem key={child.id} section={child} />
                    ))}
                </div>
            )}
        </details>
    );
}
