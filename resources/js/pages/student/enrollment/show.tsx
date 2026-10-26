import { StudyOutline, StudyProgressBar } from '@/components/study-outline';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/student/enrollment';
import { lesson as lessonRoute, visit } from '@/routes/student/study';
import type {
    StudyContent,
    StudyLesson,
    StudyProgress,
    StudySection,
} from '@/types/study';
import { Head, Link, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    space: StudyProgress & { id: number; name: string; courseTitle: string };
    lesson: { id: number; name: string; sectionName: string };
    sections: StudySection[];
    contents: StudyContent[];
    previousLesson: StudyLesson | null;
    nextLesson: StudyLesson | null;
}

export default function Show(props: Props) {
    return <Reader key={`${props.space.id}-${props.lesson.id}`} {...props} />;
}

function Reader({
    space,
    lesson,
    sections,
    contents,
    previousLesson,
    nextLesson,
}: Props) {
    const visitStarted = useRef(false);
    const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>(
        'saving',
    );

    useEffect(() => {
        if (visitStarted.current) {
            return;
        }
        visitStarted.current = true;
        router.post(
            visit({ space: space.id, lesson: lesson.id }).url,
            {},
            {
                async: true,
                showProgress: false,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSaveStatus('saved'),
                onError: () => setSaveStatus('error'),
                onCancel: () => setSaveStatus('error'),
            },
        );
    }, [space.id, lesson.id]);

    function retrySave() {
        setSaveStatus('saving');
        router.post(
            visit({ space: space.id, lesson: lesson.id }).url,
            {},
            {
                async: true,
                showProgress: false,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSaveStatus('saved'),
                onError: () => setSaveStatus('error'),
                onCancel: () => setSaveStatus('error'),
            },
        );
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'دوره‌های در حال مطالعه', href: index().url },
                {
                    title: space.name,
                    href: index({ query: { space: space.id } }).url,
                },
                {
                    title: lesson.name,
                    href: lessonRoute({ space: space.id, lesson: lesson.id })
                        .url,
                },
            ]}
        >
            <Head title={`${lesson.name} | ${space.name}`} />
            <main
                lang="fa"
                dir="rtl"
                className="storefront min-w-0 flex-1 space-y-8 bg-[#f8f7f3] p-5 text-right text-[#243b37] lg:p-10 dark:bg-[#142823] dark:text-[#f8f7f3]"
            >
                <header className="space-y-3">
                    <Link
                        href={index()}
                        className="text-sm underline underline-offset-4"
                    >
                        بازگشت به کتابخانه
                    </Link>
                    <p className="storefront-eyebrow leading-8">
                        {space.courseTitle} · {space.name}
                    </p>
                    <p className="text-sm opacity-70">
                        بخش: {lesson.sectionName}
                    </p>
                    <h1 className="storefront-heading text-2xl leading-10 font-bold">
                        {lesson.name}
                    </h1>
                    <StudyProgressBar {...space} />
                    <p role="status" className="text-sm leading-7 opacity-70">
                        {saveStatus === 'saving'
                            ? 'در حال ثبت مطالعه…'
                            : saveStatus === 'saved'
                              ? 'مطالعهٔ محتوای این درس ثبت شد.'
                              : 'ثبت مطالعه انجام نشد.'}
                    </p>
                    {saveStatus === 'error' && (
                        <button
                            type="button"
                            onClick={retrySave}
                            className="storefront-button"
                        >
                            تلاش دوباره برای ثبت مطالعه
                        </button>
                    )}
                </header>
                <div className="grid min-w-0 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="min-w-0 space-y-6">
                        {contents.map((content) => (
                            <article
                                key={content.id}
                                className="min-w-0 space-y-4 rounded-3xl border border-current/10 bg-white/50 p-5 sm:p-8 dark:bg-white/5"
                            >
                                <ContentBlock content={content} />
                            </article>
                        ))}
                        <nav
                            aria-label="جابه‌جایی بین درس‌ها"
                            className="flex flex-wrap justify-between gap-4 border-t border-current/10 pt-6"
                        >
                            {previousLesson ? (
                                <Link
                                    href={lessonRoute({
                                        space: space.id,
                                        lesson: previousLesson.id,
                                    })}
                                    className="storefront-button max-w-full break-words"
                                >
                                    درس قبلی: {previousLesson.name}
                                </Link>
                            ) : (
                                <span />
                            )}
                            {nextLesson && (
                                <Link
                                    href={lessonRoute({
                                        space: space.id,
                                        lesson: nextLesson.id,
                                    })}
                                    className="storefront-button max-w-full break-words"
                                >
                                    درس بعدی: {nextLesson.name}
                                </Link>
                            )}
                        </nav>
                    </div>
                    <aside className="min-w-0 space-y-4 rounded-3xl border border-current/10 p-5">
                        <h2 className="font-bold">سرفصل‌ها</h2>
                        <StudyOutline
                            spaceId={space.id}
                            sections={sections}
                            currentLessonId={lesson.id}
                        />
                    </aside>
                </div>
            </main>
        </AppLayout>
    );
}

function ContentBlock({ content }: { content: StudyContent }) {
    return (
        <>
            {content.description && (
                <h2 className="text-lg leading-8 font-semibold">
                    {content.description}
                </h2>
            )}
            {content.type === 'text' && (
                <div
                    dir="auto"
                    className="leading-9 break-words whitespace-pre-wrap"
                >
                    {content.body}
                </div>
            )}
            {content.type === 'image' && content.url && (
                <figure className="space-y-3">
                    <img
                        src={content.url}
                        alt={content.name || content.description}
                        className="mx-auto h-auto max-w-full rounded-2xl"
                    />
                    <figcaption className="text-sm opacity-70">
                        {content.name}
                    </figcaption>
                </figure>
            )}
            {content.type === 'video' &&
                (content.url ? (
                    <div className="space-y-3">
                        <video
                            controls
                            preload="metadata"
                            playsInline
                            src={content.url}
                            aria-label={content.name || 'ویدیوی درس'}
                            className="w-full rounded-2xl bg-black"
                        >
                            مرورگر شما امکان پخش این ویدیو را ندارد.
                        </video>
                        <p className="text-sm opacity-70">{content.name}</p>
                    </div>
                ) : (
                    <p className="leading-8">ویدیو در دسترس نیست.</p>
                ))}
            {content.type === 'file' && content.url && (
                <a
                    href={content.url}
                    className="storefront-button inline-flex max-w-full items-center gap-2 break-all"
                >
                    <Download className="size-4 shrink-0" />
                    دریافت فایل: {content.name}
                </a>
            )}
            {content.type === 'table' && (
                <div className="max-w-full overflow-x-auto">
                    <table
                        dir="rtl"
                        className="w-full border-collapse text-right text-sm leading-8"
                    >
                        <tbody>
                            {content.rows?.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="border border-current/15 p-3"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {content.type === 'remind' && content.target && (
                <div className="space-y-4 border-r-2 border-[#8b9b5a] pr-4">
                    <p className="text-sm opacity-70">یادآوری</p>
                    <ContentBlock content={content.target} />
                </div>
            )}
            {content.type === 'unavailable' && (
                <p className="leading-8 opacity-70">این محتوا در دسترس نیست.</p>
            )}
        </>
    );
}
