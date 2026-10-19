import { useCourseEditorDirty } from '@/components/course-editor-state';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { destroy, update } from '@/routes/teacher/content/editor';
import type {
    CourseEditorContent,
    CourseEditorOverview,
    CourseEditorSaveStatus,
} from '@/types/course-editor';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

const labels = {
    text: 'متن',
    image: 'تصویر',
    video: 'ویدئو',
    file: 'فایل',
    table: 'جدول',
    remind: 'ارجاع / یادآوری',
};

function values(content: CourseEditorContent) {
    return {
        type: content.type === 'unknown' ? 'text' : content.type,
        description: content.description ?? '',
        body: content.body ?? '',
        name: content.name ?? '',
        url: content.type === 'video' ? (content.url ?? '') : '',
        table: content.table ?? [['', '']],
        content_id: String(content.remind_content_id ?? ''),
        image_file: null as File | null,
        content_file: null as File | null,
        accesses: content.accesses.map((access) => ({
            plan_id: access.plan_id,
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
    const [deleteError, setDeleteError] = useState('');
    const [uploadKey, setUploadKey] = useState(0);
    const lock = useRef(false);
    const busy = form.processing || deleting;
    const errors = form.errors as Record<string, string>;
    const plans = overview.spaces.flatMap((space) =>
        space.plans.map((plan) => ({ ...plan, spaceName: space.name })),
    );
    const targets = overview.sections.flatMap((section) =>
        section.lessons.flatMap((lesson) =>
            lesson.contents
                .filter((item) => item.id !== content.id)
                .map((item) => ({
                    id: item.id,
                    label: `${section.name} ← ${lesson.name} ← ${item.description || item.name || `محتوا ${item.id}`}`,
                })),
        ),
    );
    useCourseEditorDirty(form.isDirty);
    useEffect(() => {
        onDirty(form.isDirty);
    }, [form.isDirty, onDirty]);
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
                        onChange={(event) =>
                            form.setData(
                                'type',
                                event.target.value as typeof form.data.type,
                            )
                        }
                    >
                        {Object.entries(labels).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.type} />
                </div>
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
                {form.data.type === 'text' && (
                    <div className="space-y-2">
                        <Label htmlFor="content-body">متن محتوا</Label>
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
                            <Label htmlFor="content-url">نشانی ویدئو</Label>
                            <Input
                                id="content-url"
                                type="url"
                                dir="ltr"
                                required
                                value={form.data.url}
                                onChange={(event) =>
                                    form.setData('url', event.target.value)
                                }
                            />
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
                        <Label htmlFor="content-target">
                            محتوای مرجع در همین دوره
                        </Label>
                        <select
                            id="content-target"
                            required
                            className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                            value={form.data.content_id}
                            onChange={(event) =>
                                form.setData('content_id', event.target.value)
                            }
                        >
                            <option value="">انتخاب محتوا</option>
                            {targets.map((target) => (
                                <option key={target.id} value={target.id}>
                                    {target.label}
                                </option>
                            ))}
                        </select>
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
                                        overview.spaces
                                            .filter(
                                                (space) =>
                                                    space.quiz_id !== null,
                                            )
                                            .map((space) => {
                                                const requirement =
                                                    access.requirements.find(
                                                        (item) =>
                                                            item.space_id ===
                                                            space.id,
                                                    );
                                                const change = (
                                                    checked: boolean,
                                                    score = 0,
                                                ) =>
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
                                                                                  ...item.requirements.filter(
                                                                                      (
                                                                                          row,
                                                                                      ) =>
                                                                                          row.space_id !==
                                                                                          space.id,
                                                                                  ),
                                                                                  ...(checked
                                                                                      ? [
                                                                                            {
                                                                                                space_id:
                                                                                                    space.id,
                                                                                                score,
                                                                                            },
                                                                                        ]
                                                                                      : []),
                                                                              ],
                                                                      }
                                                                    : item,
                                                        ),
                                                    );
                                                return (
                                                    <div
                                                        key={space.id}
                                                        className="space-y-2 border-s ps-3"
                                                    >
                                                        <label className="flex items-center gap-2 text-xs">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    !!requirement
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    change(
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                    )
                                                                }
                                                            />
                                                            پیش‌نیاز آزمون{' '}
                                                            {space.name}
                                                        </label>
                                                        {requirement && (
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor={`score-${plan.id}-${space.id}`}
                                                                >
                                                                    حداقل نمره
                                                                </Label>
                                                                <Input
                                                                    id={`score-${plan.id}-${space.id}`}
                                                                    type="number"
                                                                    min={0}
                                                                    max={32767}
                                                                    required
                                                                    value={
                                                                        requirement.score
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        change(
                                                                            true,
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
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
