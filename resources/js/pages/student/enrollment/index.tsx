import { persianNumber } from '@/components/storefront';
import { StudyOutline, StudyProgressBar } from '@/components/study-outline';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index } from '@/routes/student/enrollment';
import { lesson } from '@/routes/student/study';
import { show as showAttempt, start as startQuiz } from '@/routes/student/quiz';
import { BreadcrumbItem } from '@/types';
import type { StudySpace } from '@/types/study';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'داشبورد',
        href: dashboard().url,
    },
    {
        title: 'دوره‌های در حال مطالعه',
        href: index().url,
    },
];

export default function Index({ spaces }: { spaces: StudySpace[] }) {
    const expandedSpaceId = new URLSearchParams(
        usePage().url.split('?')[1],
    ).get('space');
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="دوره‌های در حال مطالعه" />
            <main
                lang="fa"
                dir="rtl"
                className="storefront min-w-0 flex-1 space-y-8 bg-[#f8f7f3] p-5 text-right text-[#243b37] lg:p-10 dark:bg-[#142823] dark:text-[#f8f7f3]"
            >
                <header className="space-y-2">
                    <p className="storefront-eyebrow">کتابخانهٔ من</p>
                    <h1 className="storefront-heading text-2xl font-bold">
                        دوره‌های در حال مطالعه
                    </h1>
                    <p className="text-sm leading-8 opacity-70">
                        {persianNumber(spaces.length)} فضای آموزشی · مرتب‌شده بر
                        اساس آخرین بازدید
                    </p>
                </header>
                {spaces.length === 0 && (
                    <div className="rounded-3xl border border-current/10 p-8 leading-8">
                        هنوز در هیچ فضای آموزشی ثبت‌نام نکرده‌اید.
                    </div>
                )}
                <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
                    {spaces.map((space) => (
                        <article
                            key={space.id}
                            className="min-w-0 space-y-6 rounded-3xl border border-current/10 bg-white/50 p-5 shadow-sm sm:p-7 dark:bg-white/5"
                        >
                            <div className="space-y-2 break-words">
                                <p className="text-sm opacity-70">
                                    {space.courseTitle}
                                </p>
                                <h2 className="flex items-center justify-end gap-3 text-xl font-bold">
                                    {space.name}
                                    <BookOpen className="size-5 shrink-0" />
                                </h2>
                                <p className="text-sm leading-7 opacity-70">
                                    پلن‌های شما: {space.plans.join('، ')}
                                </p>
                            </div>
                            <StudyProgressBar {...space} />
                            {space.quizzes.length > 0 && (
                                <details className="border-t border-current/10 pt-4">
                                    <summary className="cursor-pointer rounded-xl py-2 font-semibold focus-visible:outline-2 focus-visible:outline-[#8b9b5a]">آزمون‌ها و سابقهٔ شرکت</summary>
                                    <div className="space-y-4 pt-4">
                                        {space.quizzes.map((quiz) => (
                                            <section key={quiz.id} className="space-y-3 rounded-2xl border border-current/10 p-4">
                                                <h3 className="font-semibold">{quiz.final ? 'آزمون پایانی' : 'آزمونک'}: {quiz.title}</h3>
                                                <p className="text-sm">تعداد شرکت: {persianNumber(quiz.attempts.length)} از {quiz.limit === null ? 'نامحدود' : persianNumber(quiz.limit)}</p>
                                                {quiz.attempts.length === 0 ? <p className="text-sm opacity-70">هنوز در این آزمون شرکت نکرده‌اید.</p> : (
                                                    <ul className="space-y-2 text-sm">
                                                        {quiz.attempts.map((attempt) => (
                                                            <li key={attempt.id}>
                                                                <Link className="underline underline-offset-4" href={showAttempt(attempt.id)}>
                                                                    {attempt.startedAt ? new Date(attempt.startedAt).toLocaleString('fa-IR') : 'شرکت قبلی'} · {attempt.finished ? `نتیجه: ${persianNumber(Number(attempt.score))}` : 'ادامهٔ آزمون'}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {!quiz.attempts.some((attempt) => !attempt.finished) && quiz.canStart && (
                                                    <Link as="button" method="post" href={startQuiz.url({ space: space.id, quiz: quiz.id })} data={quiz.contentId ? { content: quiz.contentId } : {}} className="storefront-button">شرکت در آزمون</Link>
                                                )}
                                            </section>
                                        ))}
                                    </div>
                                </details>
                            )}
                            {space.resumeLessonId !== null && (
                                <Link
                                    href={lesson({
                                        space: space.id,
                                        lesson: space.resumeLessonId,
                                    })}
                                    className="storefront-button inline-flex"
                                >
                                    {space.lastVisitedAt || space.readCount > 0
                                        ? 'ادامهٔ مطالعه'
                                        : 'شروع مطالعه'}
                                </Link>
                            )}
                            <details
                                open={expandedSpaceId === String(space.id)}
                                className="border-t border-current/10 pt-4"
                            >
                                <summary className="cursor-pointer rounded-xl py-2 font-semibold focus-visible:outline-2 focus-visible:outline-[#8b9b5a]">
                                    مشاهدهٔ سرفصل‌ها
                                </summary>
                                <div className="pt-4">
                                    <StudyOutline
                                        spaceId={space.id}
                                        sections={space.sections}
                                    />
                                </div>
                            </details>
                        </article>
                    ))}
                </div>
            </main>
        </AppLayout>
    );
}
