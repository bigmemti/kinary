import { useCourseEditorDirty } from '@/components/course-editor-state';
import InputError from '@/components/input-error';
import { MarkdownContent } from '@/components/markdown-content';
import { RichTextEditor as Textarea } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy, update } from '@/routes/teacher/content/editor';
import { index as homeworkIndex } from '@/routes/teacher/homework';
import { editor as quizEditor } from '@/routes/teacher/quiz';
import type {
    CourseEditorContent,
    CourseEditorOverview,
    CourseEditorSaveStatus,
} from '@/types/course-editor';
import { Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

const labels = {
    text: 'متن',
    image: 'تصویر',
    video: 'ویدئو',
    file: 'فایل',
    table: 'جدول',
    remind: 'ارجاع / یادآوری',
    quiz: 'آزمونک',
    homework: 'تکلیف',
    exercise: 'تمرین',
    deck: 'دسته فلش‌کارت',
};

function values(content: CourseEditorContent) {
    return {
        type: content.type === 'unknown' ? 'text' : content.type,
        description: content.description ?? '',
        body: content.body ?? '',
        allowed_extensions: content.allowed_extensions ?? '',
        answer_body: content.answer_body ?? '',
        answer_video_url: content.answer_video_url ?? '',
        name: content.name ?? '',
        cards: content.cards?.length ? content.cards : [{ question: '', answer: '' }],
        url: content.type === 'video' ? (content.url ?? '') : '',
        table: content.table ?? [['', '']],
        content_id: String(content.remind_content_id ?? ''),
        image_file: null as File | null,
        content_file: null as File | null,
        accesses: content.accesses.map((access) => ({
            plan_id: access.plan_id,
            answer_release: access.answer_release ?? 'submitted',
            answer_video_release: access.answer_video_release ?? 'never',
            requirements: access.requirements.map((row) => ({ ...row })),
        })),
    };
}

export default function CourseEditorContentForm({
    content,
    overview,
    onStatus,
    onDirty,
    onDeleted,
}: {
    content: CourseEditorContent;
    overview: CourseEditorOverview;
    onStatus: (status: CourseEditorSaveStatus) => void;
    onDirty: (dirty: boolean) => void;
    onDeleted: () => void;
}) {
    const form = useForm(values(content));
    const [deleting, setDeleting] = useState(false);
    const [requirementSearch, setRequirementSearch] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [uploadKey, setUploadKey] = useState(0);
    const [sourceCourse, setSourceCourse] = useState('');
    const [sourceLesson, setSourceLesson] = useState('');
    const [sourceCourses, setSourceCourses] = useState<
        { id: number; title: string }[]
    >([]);
    const [sourceLessons, setSourceLessons] = useState<
        { id: number; name: string }[]
    >([]);
    const [sourceContents, setSourceContents] = useState<
        { id: number; name: string }[]
    >([]);
    const [sourceError, setSourceError] = useState('');
    const [sourceLoading, setSourceLoading] = useState(
        content.type === 'remind',
    );
    const [sourcePreview, setSourcePreview] = useState<{
        type: string;
        body: string | null;
        name: string | null;
        url: string | null;
        rows: string[][] | null;
    } | null>(null);
    const [sourceRetry, setSourceRetry] = useState(0);
    const lock = useRef(false);
    const busy = form.processing || deleting;
    const errors = form.errors as Record<string, string>;
    const plans = overview.spaces.flatMap((space) =>
        space.plans.map((plan) => ({
            ...plan,
            spaceName: space.name,
            spaceId: space.id,
        })),
    );
    const lesson = overview.sections
        .flatMap((section) => section.lessons)
        .find((item) =>
            item.contents.some((itemContent) => itemContent.id === content.id),
        );
    useEffect(() => {
        if (form.data.type !== 'remind') return;
        const controller = new AbortController();
        const query = new URLSearchParams();
        if (sourceCourse) query.set('source', sourceCourse);
        if (sourceLesson) query.set('lesson', sourceLesson);
        fetch(`${overview.reminder_source_url}?${query}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) throw new Error();
                return response.json();
            })
            .then((data) => {
                if (sourceLesson) setSourceContents(data);
                else if (sourceCourse) setSourceLessons(data);
                else setSourceCourses(data);
            })
            .catch((error) => {
                if (error.name !== 'AbortError')
                    setSourceError('دریافت فهرست انجام نشد. دوباره تلاش کنید.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setSourceLoading(false);
            });
        return () => controller.abort();
    }, [
        form.data.type,
        overview.reminder_source_url,
        sourceCourse,
        sourceLesson,
        sourceRetry,
    ]);
    useEffect(() => {
        if (
            form.data.type !== 'remind' ||
            !sourceCourse ||
            !sourceLesson ||
            !form.data.content_id
        )
            return;
        const controller = new AbortController();
        const query = new URLSearchParams({
            source: sourceCourse,
            lesson: sourceLesson,
            content: form.data.content_id,
        });
        fetch(`${overview.reminder_source_url}?${query}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) throw new Error();
                return response.json();
            })
            .then(setSourcePreview)
            .catch((error) => {
                if (error.name !== 'AbortError')
                    setSourceError('پیش‌نمایش محتوا دریافت نشد.');
            });
        return () => controller.abort();
    }, [
        form.data.type,
        form.data.content_id,
        overview.reminder_source_url,
        sourceCourse,
        sourceLesson,
        sourceRetry,
    ]);
    const originalValues = values(content);
    const isDirty =
        form.data.type === 'quiz' && content.type !== 'quiz'
            ? Boolean(form.data.image_file || form.data.content_file) ||
              JSON.stringify({ ...form.data, type: originalValues.type }) !==
                  JSON.stringify(originalValues)
            : form.isDirty;
    useCourseEditorDirty(isDirty);
    useEffect(() => {
        onDirty(isDirty);
    }, [isDirty, onDirty]);
    useEffect(() => () => onDirty(false), [onDirty]);

    function submit(event: FormEvent) {
        event.preventDefault();
        if (lock.current || busy) return;
        lock.current = true;
        form.transform((data) => {
            const { accesses, ...fields } = data;
            return {
                ...fields,
                _method: 'patch',
                ...(overview.permissions.manage_commerce
                    ? { update_accesses: true, accesses }
                    : {}),
            };
        });
        form.post(update.url(content.id), {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            only: ['overview', 'errors'],
            onStart: () => onStatus('saving'),
            onError: () => onStatus('error'),
            onSuccess: (page) => {
                const saved = (
                    page.props.overview as CourseEditorOverview
                ).sections
                    .flatMap((section) =>
                        section.lessons.flatMap((lesson) => lesson.contents),
                    )
                    .find((item) => item.id === content.id);
                if (saved) {
                    const next = values(saved);
                    form.setData(next);
                    form.setDefaults(next);
                    setUploadKey((key) => key + 1);
                }
                onStatus('saved');
            },
            onFinish: () => {
                lock.current = false;
            },
            onCancel: () => {
                lock.current = false;
                onStatus('error');
            },
        });
    }

    function remove() {
        if (
            lock.current ||
            busy ||
            content.delete_block_reason ||
            !window.confirm('این محتوا حذف شود؟ این کار قابل بازگشت نیست.')
        )
            return;
        lock.current = true;
        setDeleting(true);
        onStatus('saving');
        router.delete(destroy.url(content.id), {
            only: ['overview', 'errors'],
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                onDeleted();
                onStatus('saved');
            },
            onError: (errors) => {
                setDeleteError(Object.values(errors)[0]);
                onStatus('error');
            },
            onFinish: () => {
                lock.current = false;
                setDeleting(false);
            },
        });
    }

    return (
        <form
            onSubmit={submit}
            aria-label="ویرایش محتوا"
            className="space-y-5"
            onChange={() => onStatus('dirty')}
        >
            <h2 className="font-semibold">تنظیمات محتوا</h2>
            <fieldset disabled={busy} className="min-w-0 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="content-type">نوع محتوا</Label>
                    <select
                        id="content-type"
                        className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                        value={form.data.type}
                        onChange={(event) => {
                            setSourceLoading(event.target.value === 'remind');
                            setSourceError('');
                            setSourcePreview(null);
                            form.setData(
                                'type',
                                event.target.value as typeof form.data.type,
                            );
                            if (event.target.value === 'exercise') {
                                form.setData((data) => ({ ...data, type: 'exercise', accesses: data.accesses.map((access) => ({ ...access, answer_release: access.answer_release === 'always' ? 'always' : 'never', answer_video_release: access.answer_video_release === 'always' ? 'always' : 'never' })) }));
                            }
                        }}
                    >
                        {Object.entries(labels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.type} />
                </div>
                {form.data.type === 'quiz' && (
                    <div className="space-y-2 rounded-lg border p-3">
                        <p className="text-sm leading-7">
                            برای ایجاد آزمونک، فضای آموزشی آن را انتخاب کنید.
                        </p>
                        {overview.permissions.manage_commerce && lesson ? (
                            overview.spaces.map((space) => (
                                <Link
                                    key={space.id}
                                    className="block rounded-md border p-2 text-sm"
                                    href={quizEditor(space.id, {
                                        query: {
                                            lesson: lesson.id,
                                            content: content.id,
                                        },
                                    })}
                                >
                                    ایجاد آزمون جدید در {space.name}
                                </Link>
                            ))
                        ) : (
                            <p className="text-sm">
                                ساخت آزمونک به دسترسی مدیریت پلن‌ها نیاز دارد.
                            </p>
                        )}
                        {overview.spaces.length === 0 && (
                            <p className="text-sm">
                                ابتدا یک فضای آموزشی ایجاد کنید.
                            </p>
                        )}
                    </div>
                )}
                {form.data.type === 'deck' && (
                    <div className="space-y-4">
                        <Label htmlFor="deck-name">نام دسته</Label>
                        <Input id="deck-name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                        <InputError message={errors.name} />
                        {form.data.cards.map((card, index) => (
                            <div key={index} className="space-y-2 rounded-xl border p-4">
                                <Label htmlFor={`card-question-${index}`}>پرسش کارت {index + 1}</Label>
                                <Textarea id={`card-question-${index}`} value={card.question} onChange={(event) => form.setData('cards', form.data.cards.map((item, i) => i === index ? { ...item, question: event.target.value } : item))} />
                                <InputError message={errors[`cards.${index}.question`]} />
                                <Label htmlFor={`card-answer-${index}`}>پاسخ کارت</Label>
                                <Textarea id={`card-answer-${index}`} value={card.answer} onChange={(event) => form.setData('cards', form.data.cards.map((item, i) => i === index ? { ...item, answer: event.target.value } : item))} />
                                <InputError message={errors[`cards.${index}.answer`]} />
                                {form.data.cards.length > 1 && <Button type="button" variant="outline" onClick={() => form.setData('cards', form.data.cards.filter((_, i) => i !== index))}>حذف کارت</Button>}
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => form.setData('cards', [...form.data.cards, { question: '', answer: '' }])}>افزودن کارت</Button>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="content-description">توضیحات</Label>
                    <Textarea
                        id="content-description"
                        value={form.data.description}
                        maxLength={2000}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                    />
                    <InputError message={errors.description} />
                </div>
                {(form.data.type === 'text' ||
                    form.data.type === 'homework' || form.data.type === 'exercise') && (
                    <div className="space-y-2">
                        <Label htmlFor="content-body">
                            {form.data.type === 'homework' || form.data.type === 'exercise'
                                ? 'صورت سؤال'
                                : 'متن محتوا'}
                        </Label>
                        <Textarea
                            id="content-body"
                            rows={10}
                            required
                            value={form.data.body}
                            onChange={(event) =>
                                form.setData('body', event.target.value)
                            }
                        />
                        <InputError message={errors.body} />
                    </div>
                )}
                {(form.data.type === 'homework' || form.data.type === 'exercise') && (
                    <div className="space-y-2">
                        {form.data.type === 'homework' && <>
                        <Label htmlFor="homework-extensions">
                            پسوندهای مجاز فایل
                        </Label>
                        <Input
                            id="homework-extensions"
                            dir="ltr"
                            placeholder="pdf, png, txt, py, js, php"
                            value={form.data.allowed_extensions}
                            onChange={(event) =>
                                form.setData(
                                    'allowed_extensions',
                                    event.target.value,
                                )
                            }
                        />
                        <p className="text-sm">
                            پسوندها را با ویرگول جدا کنید. فایل ZIP همیشه مجاز
                            است.
                        </p>
                        <InputError message={errors.allowed_extensions} />
                        </>}
                        <Label htmlFor="homework-answer">
                            متن پاسخ (اختیاری)
                        </Label>
                        <Textarea
                            id="homework-answer"
                            rows={8}
                            value={form.data.answer_body}
                            onChange={(event) =>
                                form.setData('answer_body', event.target.value)
                            }
                        />
                        <InputError message={errors.answer_body} />
                        <Label htmlFor="homework-answer-video">
                            نشانی ویدیوی پاسخ (اختیاری)
                        </Label>
                        <Input
                            id="homework-answer-video"
                            dir="ltr"
                            type="url"
                            value={form.data.answer_video_url}
                            onChange={(event) =>
                                form.setData(
                                    'answer_video_url',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={errors.answer_video_url} />
                        {content.type === 'homework' && (
                            <Link
                                className="block underline"
                                href={homeworkIndex(content.id)}
                            >
                                مشاهده ارسال‌های تکلیف
                            </Link>
                        )}
                    </div>
                )}
                {['video', 'image', 'file'].includes(form.data.type) && (
                    <div className="space-y-2">
                        <Label htmlFor="content-name">نام رسانه یا فایل</Label>
                        <Input
                            id="content-name"
                            required={form.data.type === 'video'}
                            value={form.data.name}
                            maxLength={255}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>
                )}
                {form.data.type === 'video' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="content-url">کد امبد ویدئو</Label>
                            <textarea
                                id="content-url"
                                dir="ltr"
                                required
                                rows={5}
                                className="w-full rounded-md border bg-background p-3 text-sm"
                                placeholder="<iframe src=...></iframe>"
                                value={form.data.url}
                                onChange={(event) =>
                                    form.setData('url', event.target.value)
                                }
                            />
                            <p className="text-sm">
                                کد امبد ویدئو را از آپارات یا یوتیوب کپی و اینجا
                                وارد کنید.
                            </p>
                            <InputError message={errors.url} />
                        </div>
                    </>
                )}
                {(form.data.type === 'image' || form.data.type === 'file') && (
                    <div className="space-y-2">
                        <Label htmlFor="content-upload">
                            {form.data.type === 'image'
                                ? 'تصویر (حداکثر ۱۰ مگابایت)'
                                : 'فایل (حداکثر ۵۰ مگابایت)'}
                        </Label>
                        {content.type === form.data.type && content.name && (
                            <p className="text-sm break-words">
                                فایل فعلی: {content.name}
                            </p>
                        )}
                        {content.type === 'file' &&
                            form.data.type === 'file' &&
                            content.url && (
                                <a
                                    className="block text-sm text-primary underline"
                                    href={content.url}
                                >
                                    دریافت فایل فعلی
                                </a>
                            )}
                        {content.type === 'image' &&
                            form.data.type === 'image' &&
                            content.url && (
                                <img
                                    src={content.url}
                                    alt={content.name ?? 'تصویر محتوا'}
                                    className="max-h-48 max-w-full rounded-lg object-contain"
                                />
                            )}
                        <Input
                            key={`${uploadKey}-${form.data.type}`}
                            id="content-upload"
                            type="file"
                            accept={
                                form.data.type === 'image'
                                    ? '.jpg,.jpeg,.png,.webp,.gif'
                                    : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv'
                            }
                            required={content.type !== form.data.type}
                            onChange={(event) =>
                                form.setData(
                                    form.data.type === 'image'
                                        ? 'image_file'
                                        : 'content_file',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <InputError
                            message={errors.image_file || errors.content_file}
                        />
                    </div>
                )}
                {form.data.type === 'table' && (
                    <div className="space-y-3">
                        <Label>سلول‌های جدول</Label>
                        <div className="max-w-full overflow-x-auto">
                            <table className="w-full">
                                <tbody>
                                    {form.data.table.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, columnIndex) => (
                                                <td
                                                    key={columnIndex}
                                                    className="p-1"
                                                >
                                                    <Input
                                                        aria-label={`ردیف ${rowIndex + 1} ستون ${columnIndex + 1}`}
                                                        value={cell ?? ''}
                                                        maxLength={500}
                                                        className="min-w-24"
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'table',
                                                                form.data.table.map(
                                                                    (
                                                                        current,
                                                                        index,
                                                                    ) =>
                                                                        index ===
                                                                        rowIndex
                                                                            ? current.map(
                                                                                  (
                                                                                      value,
                                                                                      column,
                                                                                  ) =>
                                                                                      column ===
                                                                                      columnIndex
                                                                                          ? event
                                                                                                .target
                                                                                                .value
                                                                                          : value,
                                                                              )
                                                                            : current,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={form.data.table.length >= 50}
                                onClick={() =>
                                    form.setData('table', [
                                        ...form.data.table,
                                        form.data.table[0].map(() => ''),
                                    ])
                                }
                            >
                                افزودن ردیف
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={form.data.table[0].length >= 20}
                                onClick={() =>
                                    form.setData(
                                        'table',
                                        form.data.table.map((row) => [
                                            ...row,
                                            '',
                                        ]),
                                    )
                                }
                            >
                                افزودن ستون
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={form.data.table.length <= 1}
                                onClick={() =>
                                    form.setData(
                                        'table',
                                        form.data.table.slice(0, -1),
                                    )
                                }
                            >
                                حذف ردیف آخر
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={form.data.table[0].length <= 1}
                                onClick={() =>
                                    form.setData(
                                        'table',
                                        form.data.table.map((row) =>
                                            row.slice(0, -1),
                                        ),
                                    )
                                }
                            >
                                حذف ستون آخر
                            </Button>
                        </div>
                    </div>
                )}
                {form.data.type === 'remind' && (
                    <div className="space-y-2">
                        <p className="text-sm">
                            محتوای انتخاب‌شده برای دانشجویان این دوره، حتی بدون
                            دسترسی به دورهٔ مبدأ، نمایش داده می‌شود.
                        </p>
                        <Label htmlFor="reminder-course">دورهٔ مرجع</Label>
                        <select
                            id="reminder-course"
                            className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                            value={sourceCourse}
                            onChange={(event) => {
                                setSourceLoading(true);
                                setSourceError('');
                                setSourcePreview(null);
                                setSourceCourse(event.target.value);
                                setSourceLesson('');
                                setSourceLessons([]);
                                setSourceContents([]);
                                form.setData('content_id', '');
                            }}
                        >
                            <option value="">انتخاب دوره</option>
                            {sourceCourses.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.title}
                                </option>
                            ))}
                        </select>
                        <Label htmlFor="reminder-lesson">درس مرجع</Label>
                        <select
                            id="reminder-lesson"
                            disabled={!sourceCourse || sourceLoading}
                            className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                            value={sourceLesson}
                            onChange={(event) => {
                                setSourceLoading(true);
                                setSourceError('');
                                setSourcePreview(null);
                                setSourceLesson(event.target.value);
                                setSourceContents([]);
                                form.setData('content_id', '');
                            }}
                        >
                            <option value="">انتخاب درس</option>
                            {sourceLessons.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <Label htmlFor="content-target">محتوای مرجع</Label>
                        <select
                            id="content-target"
                            required
                            className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                            value={form.data.content_id}
                            onChange={(event) => {
                                setSourcePreview(null);
                                setSourceError('');
                                form.setData('content_id', event.target.value);
                            }}
                        >
                            <option value="">انتخاب محتوا</option>
                            {form.data.content_id &&
                                !sourceContents.some(
                                    (item) =>
                                        String(item.id) ===
                                        form.data.content_id,
                                ) && (
                                    <option value={form.data.content_id}>
                                        {content.remind_target_label ??
                                            'محتوای انتخاب‌شدهٔ قبلی'}
                                    </option>
                                )}
                            {sourceContents
                                .filter((item) => item.id !== content.id)
                                .map((target) => (
                                    <option key={target.id} value={target.id}>
                                        {target.name}
                                    </option>
                                ))}
                        </select>
                        {sourceLoading && <p role="status">در حال دریافت…</p>}
                        {sourceError && (
                            <div role="alert">
                                {sourceError}{' '}
                                <button
                                    type="button"
                                    className="underline"
                                    onClick={() => {
                                        setSourceLoading(true);
                                        setSourceError('');
                                        setSourceRetry((value) => value + 1);
                                    }}
                                >
                                    تلاش دوباره
                                </button>
                            </div>
                        )}
                        {sourcePreview && (
                            <div className="space-y-2 rounded-lg border p-3">
                                <p className="font-semibold">
                                    پیش‌نمایش محتوای یادآوری
                                </p>
                                {sourcePreview.type === 'text' && (
                                    <MarkdownContent>
                                        {sourcePreview.body ?? ''}
                                    </MarkdownContent>
                                )}
                                {sourcePreview.type === 'image' &&
                                    sourcePreview.url && (
                                        <img
                                            src={sourcePreview.url}
                                            alt={
                                                sourcePreview.name ??
                                                'تصویر محتوا'
                                            }
                                            className="max-h-80 max-w-full"
                                        />
                                    )}
                                {sourcePreview.type === 'video' &&
                                    sourcePreview.url &&
                                    (sourcePreview.url.startsWith('embed:') ? (
                                        <iframe
                                            src={sourcePreview.url.slice(6)}
                                            title={
                                                sourcePreview.name ?? 'ویدئو'
                                            }
                                            className="aspect-video w-full"
                                        />
                                    ) : (
                                        <video
                                            controls
                                            src={sourcePreview.url}
                                            className="w-full"
                                        />
                                    ))}
                                {sourcePreview.type === 'file' &&
                                    sourcePreview.url && (
                                        <a
                                            href={sourcePreview.url}
                                            className="underline"
                                        >
                                            دریافت فایل: {sourcePreview.name}
                                        </a>
                                    )}
                                {sourcePreview.type === 'table' && (
                                    <div className="overflow-x-auto">
                                        <table>
                                            <tbody>
                                                {sourcePreview.rows?.map(
                                                    (row, index) => (
                                                        <tr key={index}>
                                                            {row.map(
                                                                (
                                                                    cell,
                                                                    cellIndex,
                                                                ) => (
                                                                    <td
                                                                        className="border p-2"
                                                                        key={
                                                                            cellIndex
                                                                        }
                                                                    >
                                                                        {cell}
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                        <InputError message={errors.content_id} />
                    </div>
                )}
                {overview.permissions.manage_commerce && (
                    <div className="space-y-3 border-t pt-4">
                        <h3 className="text-sm font-semibold">
                            دسترسی پلن‌ها و پیش‌نیازها
                        </h3>
                        <p className="text-xs leading-6 text-muted-foreground">
                            بدون انتخاب پلن، دسترسی عمومی ایجاد نمی‌شود. همه
                            پیش‌نیازهای هر پلن باید برقرار باشند.
                        </p>
                        {plans.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                ابتدا یک اسپیس و پلن بسازید.
                            </p>
                        )}
                        {plans.map((plan) => {
                            const access = form.data.accesses.find(
                                (item) => item.plan_id === plan.id,
                            );
                            return (
                                <div
                                    key={plan.id}
                                    className="space-y-3 rounded-lg border p-3"
                                >
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            disabled={content.type === 'quiz'}
                                            checked={!!access}
                                            onChange={(event) =>
                                                form.setData(
                                                    'accesses',
                                                    event.target.checked
                                                        ? [
                                                              ...form.data
                                                                  .accesses,
                                                              {
                                                                  plan_id:
                                                                      plan.id,
                                                                  answer_release:
                                                                      form.data.type === 'exercise' ? 'always' : 'submitted',
                                                                  answer_video_release:
                                                                      'never',
                                                                  requirements:
                                                                      [],
                                                              },
                                                          ]
                                                        : form.data.accesses.filter(
                                                              (item) =>
                                                                  item.plan_id !==
                                                                  plan.id,
                                                          ),
                                                )
                                            }
                                        />
                                        {plan.spaceName} / {plan.name}
                                    </label>
                                    {access &&
                                        (form.data.type === 'homework' || form.data.type === 'exercise') &&
                                        (
                                            [
                                                'answer_release',
                                                'answer_video_release',
                                            ] as const
                                        ).map((field) => (
                                            <label
                                                key={field}
                                                className="block space-y-2 text-sm"
                                            >
                                                {field === 'answer_release'
                                                    ? 'دسترسی متن پاسخ'
                                                    : 'دسترسی ویدیوی پاسخ'}
                                                <select
                                                    className="block w-full rounded-md border bg-background p-2"
                                                    value={access[field]}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'accesses',
                                                            form.data.accesses.map(
                                                                (item) =>
                                                                    item.plan_id ===
                                                                    plan.id
                                                                        ? {
                                                                              ...item,
                                                                              [field]:
                                                                                  event
                                                                                      .target
                                                                                      .value as typeof item.answer_release,
                                                                          }
                                                                        : item,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <option value="never">
                                                        بدون دسترسی
                                                    </option>
                                                    {form.data.type === 'homework' && <><option value="approved">
                                                        پس از تأیید مدرس
                                                    </option>
                                                    <option value="submitted">
                                                        پس از ارسال تکلیف
                                                    </option>
                                                    </>}<option value="always">
                                                        بلافاصله
                                                    </option>
                                                </select>
                                            </label>
                                        ))}
                                    {access && (
                                        <div className="space-y-3 border-s ps-3">
                                            <Label
                                                htmlFor={`requirement-search-${plan.id}`}
                                            >
                                                افزودن پیش‌نیاز آزمون پایانی
                                            </Label>
                                            <Input
                                                id={`requirement-search-${plan.id}`}
                                                value={requirementSearch}
                                                onChange={(event) =>
                                                    setRequirementSearch(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="جست‌وجوی دوره یا فضای آموزشی"
                                            />
                                            <select
                                                aria-label="انتخاب آزمون پیش‌نیاز"
                                                className="block w-full rounded-md border bg-background p-2"
                                                value=""
                                                onChange={(event) => {
                                                    const spaceId = Number(
                                                        event.target.value,
                                                    );
                                                    if (!spaceId) return;
                                                    form.setData(
                                                        'accesses',
                                                        form.data.accesses.map(
                                                            (item) =>
                                                                item.plan_id ===
                                                                plan.id
                                                                    ? {
                                                                          ...item,
                                                                          requirements:
                                                                              [
                                                                                  ...item.requirements,
                                                                                  {
                                                                                      space_id:
                                                                                          spaceId,
                                                                                      score: 0,
                                                                                  },
                                                                              ],
                                                                      }
                                                                    : item,
                                                        ),
                                                    );
                                                }}
                                            >
                                                <option value="">
                                                    انتخاب آزمون
                                                </option>
                                                {overview.requirement_spaces
                                                    .filter(
                                                        (space) =>
                                                            !access.requirements.some(
                                                                (row) =>
                                                                    row.space_id ===
                                                                    space.id,
                                                            ) &&
                                                            `${space.course_title} ${space.name}`
                                                                .toLocaleLowerCase()
                                                                .includes(
                                                                    requirementSearch.toLocaleLowerCase(),
                                                                ),
                                                    )
                                                    .map((space) => (
                                                        <option
                                                            key={space.id}
                                                            value={space.id}
                                                        >
                                                            {space.id ===
                                                            plan.spaceId
                                                                ? 'آزمون پایانی'
                                                                : `${space.course_title} / ${space.name}`}
                                                        </option>
                                                    ))}
                                            </select>
                                            {access.requirements.map(
                                                (requirement) => {
                                                    const source =
                                                        overview.requirement_spaces.find(
                                                            (space) =>
                                                                space.id ===
                                                                requirement.space_id,
                                                        );
                                                    return (
                                                        <div
                                                            key={
                                                                requirement.space_id
                                                            }
                                                            className="space-y-2 rounded-md border p-3"
                                                        >
                                                            <p>
                                                                {requirement.space_id ===
                                                                plan.spaceId
                                                                    ? 'آزمون پایانی'
                                                                    : source
                                                                      ? `${source.course_title} / ${source.name}`
                                                                      : `فضای ${requirement.space_id}`}
                                                            </p>
                                                            <Label
                                                                htmlFor={`score-${plan.id}-${requirement.space_id}`}
                                                            >
                                                                حداقل نمره از
                                                                ۱۰۰
                                                            </Label>
                                                            <Input
                                                                id={`score-${plan.id}-${requirement.space_id}`}
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                required
                                                                value={
                                                                    requirement.score
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    form.setData(
                                                                        'accesses',
                                                                        form.data.accesses.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.plan_id ===
                                                                                plan.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          requirements:
                                                                                              item.requirements.map(
                                                                                                  (
                                                                                                      row,
                                                                                                  ) =>
                                                                                                      row.space_id ===
                                                                                                      requirement.space_id
                                                                                                          ? {
                                                                                                                ...row,
                                                                                                                score: Number(
                                                                                                                    event
                                                                                                                        .target
                                                                                                                        .value,
                                                                                                                ),
                                                                                                            }
                                                                                                          : row,
                                                                                              ),
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                    )
                                                                }
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    form.setData(
                                                                        'accesses',
                                                                        form.data.accesses.map(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item.plan_id ===
                                                                                plan.id
                                                                                    ? {
                                                                                          ...item,
                                                                                          requirements:
                                                                                              item.requirements.filter(
                                                                                                  (
                                                                                                      row,
                                                                                                  ) =>
                                                                                                      row.space_id !==
                                                                                                      requirement.space_id,
                                                                                              ),
                                                                                      }
                                                                                    : item,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                حذف پیش‌نیاز
                                                            </Button>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {Object.keys(errors).length > 0 && (
                    <div
                        role="alert"
                        className="space-y-1 text-sm text-destructive"
                    >
                        {Object.entries(errors).map(([key, error]) => (
                            <p key={key}>{error}</p>
                        ))}
                    </div>
                )}
                {form.progress && (
                    <p role="status" className="text-sm">
                        بارگذاری: {form.progress.percentage}٪
                    </p>
                )}
                <Button className="w-full" disabled={busy} type="submit">
                    {form.processing ? 'در حال ذخیره…' : 'ذخیره محتوا'}
                </Button>
            </fieldset>
            {overview.permissions.delete_structure && (
                <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={busy || !!content.delete_block_reason}
                    onClick={remove}
                >
                    حذف محتوا
                </Button>
            )}
            {content.delete_block_reason && (
                <p className="text-xs leading-6 text-muted-foreground">
                    {content.delete_block_reason}
                </p>
            )}
            <InputError message={deleteError} />
        </form>
    );
}
