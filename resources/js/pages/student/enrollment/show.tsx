import { MarkdownContent } from '@/components/markdown-content';
import CommunityComments, { type CommunityComment } from '@/components/community-comments';
import { StudyOutline, StudyProgressBar } from '@/components/study-outline';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/student/enrollment';
import {
    destroy as deleteHomework,
    store as submitHomework,
} from '@/routes/student/homework';
import { start as startQuiz } from '@/routes/student/quiz';
import { importMethod as importCards } from '@/routes/student/flashcards';
import { lesson as lessonRoute, visit } from '@/routes/student/study';
import type {
    StudyContent,
    StudyLesson,
    StudyProgress,
    StudySection,
} from '@/types/study';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    comments: CommunityComment[];
    canComment: boolean;
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
    comments,
    canComment,
}: Props) {
    const visitStarted = useRef(false);
    const quizStarted = useRef(false);
    const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>(
        'saving',
    );
    const isQuizOnly = contents.length === 1 && contents[0].type === 'quiz';
    const isLockedOnly = contents.every((content) => content.type === 'locked');
    const displayedSaveStatus =
        isQuizOnly || isLockedOnly ? 'saved' : saveStatus;

    useEffect(() => {
        const only = contents.length === 1 ? contents[0] : null;
        if (
            quizStarted.current ||
            only?.type !== 'quiz' ||
            !only.quizId ||
            only.latestScore != null
        )
            return;
        quizStarted.current = true;
        router.post(startQuiz.url({ space: space.id, quiz: only.quizId }), {
            content: only.id,
        });
    }, [contents, space.id]);

    useEffect(() => {
        if (isQuizOnly || isLockedOnly) {
            return;
        }
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
    }, [space.id, lesson.id, isQuizOnly, isLockedOnly]);

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
                    {!isLockedOnly && (
                        <p
                            role="status"
                            className="text-sm leading-7 opacity-70"
                        >
                            {displayedSaveStatus === 'saving'
                                ? 'در حال ثبت مطالعه…'
                                : displayedSaveStatus === 'saved'
                                  ? 'مطالعهٔ محتوای این درس ثبت شد.'
                                  : 'ثبت مطالعه انجام نشد.'}
                        </p>
                    )}
                    {displayedSaveStatus === 'error' && (
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
                                id={`content-${content.id}`}
                                className="min-w-0 space-y-4 rounded-3xl border border-current/10 bg-white/50 p-5 sm:p-8 dark:bg-white/5"
                            >
                                <ContentBlock
                                    content={content}
                                    spaceId={space.id}
                                />
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
                                    className="storefront-button max-w-full wrap-break-word"
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
                                    className="storefront-button max-w-full wrap-break-word"
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
                {canComment && <CommunityComments comments={comments} context={{ type: 'lesson', targetId: lesson.id, spaceId: space.id }} title="دیدگاه‌های درس" />}
            </main>
        </AppLayout>
    );
}

function ImportFlashcards({ content, spaceId }: { content: StudyContent; spaceId: number }) {
    const cards = content.cards ?? [];
    const [selected, setSelected] = useState<number[]>(cards.map((card) => card.id));
    const form = useForm({ deck_id: '', new_deck_name: content.name ?? '', cards: selected });
    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.transform((data) => ({ ...data, deck_id: data.deck_id || null, cards: selected }));
        form.post(importCards.url({ space: spaceId, content: content.id }), { preserveScroll: true });
    }
    return (
        <form onSubmit={submit} className="space-y-4">
            <h3 className="font-bold">{content.name}</h3>
            <p>کارت‌هایی را که می‌خواهید به یک دسته اضافه کنید انتخاب کنید.</p>
            <button type="button" className="underline" onClick={() => setSelected(selected.length === cards.length ? [] : cards.map((card) => card.id))}>انتخاب یا لغو انتخاب همه</button>
            <div className="space-y-3">
                {cards.map((card) => <label key={card.id} className="flex items-start gap-3 rounded-xl border border-current/15 p-3">
                    <input type="checkbox" checked={selected.includes(card.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, card.id] : selected.filter((id) => id !== card.id))} />
                    <span><MarkdownContent>{card.question}</MarkdownContent></span>
                </label>)}
            </div>
            <label className="block space-y-2">دسته مقصد
                <select className="block w-full rounded-xl border bg-background p-2" value={form.data.deck_id} onChange={(event) => form.setData('deck_id', event.target.value)}>
                    <option value="">دسته جدید</option>
                    {content.personalDecks?.map((deck) => <option key={deck.id} value={deck.id}>{deck.name}</option>)}
                </select>
            </label>
            {!form.data.deck_id && <label className="block space-y-2">نام دسته جدید<input className="block w-full rounded-xl border bg-background p-2" value={form.data.new_deck_name} onChange={(event) => form.setData('new_deck_name', event.target.value)} required /></label>}
            {Object.values(form.errors).map((error, index) => <p key={index} className="text-red-600">{error}</p>)}
            {form.recentlySuccessful && <p>کارت‌ها به دسته شما اضافه شدند.</p>}
            <button className="storefront-button" disabled={form.processing || selected.length === 0}>افزودن کارت‌های انتخاب‌شده</button>
        </form>
    );
}

function ContentBlock({
    content,
    spaceId,
}: {
    content: StudyContent;
    spaceId: number;
}) {
    return (
        <>
            {content.type === 'locked' && (
                <div className="space-y-4">
                    <p className="font-semibold">این محتوا پیش‌نیاز دارد.</p>
                    {(content.requirementAlternatives ?? []).map(
                        (requirements, index) => (
                            <div key={index} className="space-y-3">
                                {(content.requirementAlternatives?.length ??
                                    0) > 1 && <p>برای یکی از پلن‌های شما:</p>}
                                {requirements.map((requirement) => (
                                    <div
                                        key={requirement.spaceId}
                                        className="space-y-2 rounded-xl border border-current/15 p-4"
                                    >
                                        <p>
                                            {requirement.spaceId === spaceId
                                                ? 'آزمون پایانی'
                                                : `آزمون پایانی ${requirement.courseTitle} / ${requirement.spaceName}`}{' '}
                                            — حداقل نمره{' '}
                                            {requirement.score.toLocaleString(
                                                'fa-IR',
                                            )}{' '}
                                            از ۱۰۰
                                        </p>
                                        {requirement.canStart ? (
                                            <Link
                                                href={startQuiz.url({
                                                    space: requirement.spaceId,
                                                    quiz: requirement.quizId,
                                                })}
                                                method="post"
                                                as="button"
                                                className="storefront-button"
                                            >
                                                شرکت در آزمون پیش‌نیاز
                                            </Link>
                                        ) : (
                                            <p className="text-sm">
                                                در حال حاضر امکان شروع آزمون
                                                وجود ندارد.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ),
                    )}
                </div>
            )}
            {content.description && (
                <MarkdownContent className="text-lg leading-8 font-semibold">
                    {content.description}
                </MarkdownContent>
            )}
            {content.type === 'quiz' && content.quizId && (
                <div className="space-y-4">
                    <p>آزمون</p>
                    <h3>{content.name}</h3>
                    <MarkdownContent>{content.body ?? ''}</MarkdownContent>
                    {content.latestScore !== null &&
                        content.latestScore !== undefined && (
                            <p>
                                آخرین نتیجه:{' '}
                                {Number(content.latestScore).toLocaleString(
                                    'fa-IR',
                                )}
                            </p>
                        )}
                    <Link
                        href={startQuiz.url({
                            space: spaceId,
                            quiz: content.quizId,
                        })}
                        method="post"
                        data={{ content: content.id }}
                        as="button"
                        className="storefront-button"
                    >
                        شروع آزمونک
                    </Link>
                </div>
            )}
            {content.type === 'deck' && <ImportFlashcards content={content} spaceId={spaceId} />}
            {content.type === 'exercise' && (
                <div className="space-y-4">
                    <MarkdownContent>{content.body ?? ''}</MarkdownContent>
                    {(content.answer || content.answerVideoUrl) && <details className="rounded-xl border border-current/15 p-4">
                        <summary className="cursor-pointer font-semibold">مشاهده پاسخ</summary>
                        <div className="mt-4 space-y-4">
                            {content.answer && <MarkdownContent>{content.answer}</MarkdownContent>}
                            {content.answerVideoUrl && <video controls playsInline src={content.answerVideoUrl} className="w-full rounded-xl bg-black" aria-label="ویدیوی پاسخ تمرین" />}
                        </div>
                    </details>}
                </div>
            )}
            {content.type === 'homework' && (
                <Homework content={content} spaceId={spaceId} />
            )}
            {content.type === 'text' && (
                <MarkdownContent className="leading-9">
                    {content.body ?? ''}
                </MarkdownContent>
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
                        {content.url.startsWith('embed:') ? (
                            <iframe
                                src={content.url.slice(6)}
                                title={content.name || 'ویدیوی درس'}
                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                allowFullScreen
                                className="aspect-video w-full rounded-2xl bg-black"
                            />
                        ) : (
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
                        )}
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
                    {content.sourceLesson && (
                        <p className="text-sm">
                            {content.sourceCourse} · {content.sourceLesson}
                        </p>
                    )}
                    <ContentBlock content={content.target} spaceId={spaceId} />
                    {content.sourceUrl && (
                        <a
                            href={content.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="storefront-button"
                        >
                            {content.sourceAccessible
                                ? 'مشاهدهٔ درس اصلی'
                                : 'مشاهدهٔ دوره و تهیهٔ دسترسی'}
                        </a>
                    )}
                </div>
            )}
            {content.type === 'unavailable' && (
                <p className="leading-8 opacity-70">این محتوا در دسترس نیست.</p>
            )}
        </>
    );
}

function Homework({
    content,
    spaceId,
}: {
    content: StudyContent;
    spaceId: number;
}) {
    const form = useForm<{ files: File[] }>({ files: [] });
    const submission = content.submission;
    return (
        <div className="space-y-4">
            <h3 className="font-bold">تکلیف</h3>
            <MarkdownContent>{content.body ?? ''}</MarkdownContent>
            <p className="text-sm">
                فایل‌های مجاز: {content.extensions?.join('، ')}. حداکثر ۵ فایل؛
                هر فایل ۵ مگابایت و ZIP تا ۲۰ مگابایت.
            </p>
            {submission ? (
                <div className="space-y-2">
                    <p>
                        {submission.approved
                            ? 'ارسال شما تأیید شده است.'
                            : 'ارسال شما در انتظار بررسی است.'}
                    </p>
                    <ul>
                        {submission.files.map((name, index) => (
                            <li key={index}>{name}</li>
                        ))}
                    </ul>
                    {submission.score !== null && (
                        <p>
                            نمره:{' '}
                            {Number(submission.score).toLocaleString('fa-IR')}{' '}
                            از ۱۰۰
                        </p>
                    )}
                    {submission.note && <p>یادداشت مدرس: {submission.note}</p>}
                    {!submission.approved && (
                        <button
                            type="button"
                            className="storefront-button"
                            onClick={() => {
                                if (window.confirm('ارسال شما حذف شود؟'))
                                    router.delete(
                                        deleteHomework.url({
                                            space: spaceId,
                                            content: content.id,
                                        }),
                                        { preserveScroll: true },
                                    );
                            }}
                        >
                            حذف ارسال
                        </button>
                    )}
                </div>
            ) : (
                <form
                    className="space-y-3"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(
                            submitHomework.url({
                                space: spaceId,
                                content: content.id,
                            }),
                            { forceFormData: true, preserveScroll: true },
                        );
                    }}
                >
                    <label className="block">
                        فایل‌های تکلیف
                        <input
                            className="block max-w-full"
                            type="file"
                            multiple
                            required
                            accept={content.extensions
                                ?.map((extension) => `.${extension}`)
                                .join(',')}
                            onChange={(event) =>
                                form.setData(
                                    'files',
                                    Array.from(event.target.files ?? []),
                                )
                            }
                        />
                    </label>
                    {Object.values(form.errors).map((error, index) => (
                        <p role="alert" key={index}>
                            {error}
                        </p>
                    ))}
                    <button
                        disabled={form.processing}
                        className="storefront-button"
                    >
                        {form.processing ? 'در حال ارسال…' : 'ارسال تکلیف'}
                    </button>
                </form>
            )}
            {(content.answer || content.answerVideoUrl) && (
                <details className="rounded-xl border border-current/15 p-4">
                    <summary className="cursor-pointer font-semibold">
                        پاسخ را اینجا ببینید
                    </summary>
                    <div className="mt-4 space-y-4">
                        {content.answer && (
                            <MarkdownContent>{content.answer}</MarkdownContent>
                        )}
                        {content.answerVideoUrl && (
                            <video
                                controls
                                preload="metadata"
                                playsInline
                                src={content.answerVideoUrl}
                                aria-label="ویدیوی پاسخ تکلیف"
                                className="w-full rounded-xl bg-black"
                            >
                                مرورگر شما امکان پخش این ویدیو را ندارد.
                            </video>
                        )}
                    </div>
                </details>
            )}
        </div>
    );
}
