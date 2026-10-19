import CourseEditorContentForm from '@/components/course-editor-content-form';
import { useCourseEditorDirty } from '@/components/course-editor-state';
import { CourseEditorItemPanel } from '@/components/course-editor-structure';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import lessonRoutes from '@/routes/teacher/lesson';
import sectionRoutes from '@/routes/teacher/section';
import type {
    CourseEditorLesson,
    CourseEditorOverview,
    CourseEditorSaveStatus,
    CourseEditorSection,
    CourseEditorSelection,
} from '@/types/course-editor';
import { router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CourseEditorItemForm({
    overview,
    selection,
    onStatus,
    onDirty,
    onDeleted,
}: {
    overview: CourseEditorOverview;
    selection: CourseEditorSelection | null;
    onStatus: (status: CourseEditorSaveStatus) => void;
    onDirty: (dirty: boolean) => void;
    onDeleted: () => void;
}) {
    const section = overview.sections.find(
        (item) => item.id === selection?.sectionId,
    );
    const lesson =
        selection && selection.kind !== 'section'
            ? section?.lessons.find((item) => item.id === selection.lessonId)
            : undefined;
    const content =
        selection?.kind === 'content'
            ? lesson?.contents.find((item) => item.id === selection.contentId)
            : undefined;
    if (content && overview.permissions.update_structure) {
        return (
            <CourseEditorContentForm
                key={content.id}
                content={content}
                overview={overview}
                onStatus={onStatus}
                onDirty={onDirty}
                onDeleted={onDeleted}
            />
        );
    }
    if (
        !section ||
        !selection ||
        selection.kind === 'content' ||
        (selection.kind === 'lesson' && !lesson) ||
        !overview.permissions.update_structure
    ) {
        return (
            <CourseEditorItemPanel
                sections={overview.sections}
                selection={selection}
            />
        );
    }
    return (
        <ItemForm
            key={`${selection.kind}-${lesson?.id ?? section.id}`}
            section={section}
            lesson={lesson}
            overview={overview}
            onStatus={onStatus}
            onDirty={onDirty}
            onDeleted={onDeleted}
        />
    );
}

function ItemForm({
    section,
    lesson,
    overview,
    onStatus,
    onDirty,
    onDeleted,
}: {
    section: CourseEditorSection;
    lesson?: CourseEditorLesson;
    overview: CourseEditorOverview;
    onStatus: (status: CourseEditorSaveStatus) => void;
    onDirty: (dirty: boolean) => void;
    onDeleted: () => void;
}) {
    const item = lesson ?? section;
    const plans = overview.spaces.flatMap((space) =>
        space.plans.map((plan) => ({ ...plan, spaceName: space.name })),
    );
    const form = useForm({
        name: item.name,
        order: String(item.order),
        thumbnail_file: null as File | null,
        remove_thumbnail: false,
        image_files: [] as File[],
        remove_images: [] as string[],
        prices: Object.fromEntries(
            plans.map((plan) => [
                plan.id,
                String(
                    lesson?.pricings.find((price) => price.plan_id === plan.id)
                        ?.price ?? '',
                ),
            ]),
        ) as Record<string, string>,
    });
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [uploadKey, setUploadKey] = useState(0);
    const blocked = lesson
        ? lesson.contents.length > 0
        : section.lessons.length > 0;
    const busy = form.processing || deleting;
    useCourseEditorDirty(form.isDirty);
    useEffect(() => {
        onDirty(form.isDirty);
    }, [form.isDirty, onDirty]);
    useEffect(() => () => onDirty(false), [onDirty]);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (busy) return;
        form.transform((data) =>
            lesson
                ? {
                      _method: 'patch',
                      name: data.name,
                      order: data.order,
                      thumbnail_file: data.thumbnail_file,
                      remove_thumbnail: data.remove_thumbnail,
                      image_files: data.image_files,
                      remove_images: data.remove_images,
                      ...(overview.permissions.manage_commerce
                          ? {
                                update_pricings: true,
                                pricings: Object.entries(data.prices)
                                    .filter(
                                        ([id, price]) =>
                                            plans.some(
                                                (plan) =>
                                                    plan.id === Number(id),
                                            ) && price !== '',
                                    )
                                    .map(([id, price]) => ({
                                        plan_id: Number(id),
                                        price,
                                    })),
                            }
                          : {}),
                  }
                : { name: data.name, order: data.order },
        );
        const options = {
            only: ['overview', 'errors'],
            preserveScroll: true,
            preserveState: true,
            onStart: () => onStatus('saving'),
            onError: () => onStatus('error'),
            onSuccess: (page: { props: Record<string, unknown> }) => {
                const savedOverview = page.props
                    .overview as CourseEditorOverview;
                const savedSection = savedOverview.sections.find(
                    (value) => value.id === section.id,
                );
                const savedLesson = savedSection?.lessons.find(
                    (value) => value.id === lesson?.id,
                );
                const savedItem = savedLesson ?? savedSection;
                const values = {
                    ...form.data,
                    name: savedItem?.name ?? form.data.name,
                    order: String(savedItem?.order ?? form.data.order),
                    thumbnail_file: null,
                    image_files: [],
                    remove_images: [],
                    remove_thumbnail: false,
                };
                form.setData(values);
                form.setDefaults(values);
                setUploadKey((key) => key + 1);
                onStatus('saved');
            },
        };
        if (lesson)
            form.post(lessonRoutes.editor.update.url(lesson.id), {
                ...options,
                forceFormData: true,
            });
        else form.put(sectionRoutes.update.url(section.id), options);
    }

    function remove() {
        if (
            blocked ||
            busy ||
            !window.confirm(`«${item.name}» حذف شود؟ این کار قابل بازگشت نیست.`)
        )
            return;
        setDeleting(true);
        setDeleteError('');
        onStatus('saving');
        router.delete(
            lesson
                ? lessonRoutes.destroy.url(lesson.id)
                : sectionRoutes.destroy.url(section.id),
            {
                only: ['overview', 'errors'],
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    onDeleted();
                    onStatus('saved');
                },
                onError: (errors) => {
                    setDeleteError(
                        Object.values(errors)[0] ?? 'حذف انجام نشد.',
                    );
                    onStatus('error');
                },
                onFinish: () => setDeleting(false),
            },
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-semibold">
                    تنظیمات {lesson ? 'لسن' : 'سکشن'}
                </h2>
                <p className="mt-2 text-sm leading-7 break-words text-muted-foreground">
                    {section.name}
                    {lesson && ` ← ${lesson.name}`}
                </p>
            </div>
            <form onSubmit={submit} className="space-y-5">
                <fieldset disabled={busy} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="structure-name">
                            نام {lesson ? 'لسن' : 'سکشن'}
                        </Label>
                        <Input
                            id="structure-name"
                            value={form.data.name}
                            required
                            maxLength={255}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="structure-order">ترتیب نمایش</Label>
                        <Input
                            id="structure-order"
                            type="number"
                            min={0}
                            max={32767}
                            step={1}
                            value={form.data.order}
                            required
                            onChange={(e) =>
                                form.setData('order', e.target.value)
                            }
                        />
                        <InputError message={form.errors.order} />
                    </div>
                    {lesson && (
                        <>
                            <div className="space-y-3 border-t pt-4">
                                <Label htmlFor="lesson-thumbnail">
                                    تصویر شاخص
                                </Label>
                                {lesson.thumbnail_url &&
                                    !form.data.remove_thumbnail && (
                                        <img
                                            src={lesson.thumbnail_url}
                                            className="aspect-video w-full rounded-lg border object-cover"
                                            alt={`تصویر شاخص ${lesson.name}`}
                                        />
                                    )}
                                <Input
                                    id="lesson-thumbnail"
                                    key={`thumbnail-${uploadKey}`}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        form.setData(
                                            'thumbnail_file',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.thumbnail_file}
                                />
                                {lesson.thumbnail && (
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.data.remove_thumbnail}
                                            onChange={(e) =>
                                                form.setData(
                                                    'remove_thumbnail',
                                                    e.target.checked,
                                                )
                                            }
                                        />{' '}
                                        حذف تصویر شاخص فعلی
                                    </label>
                                )}
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="lesson-images">
                                    تصاویر گالری
                                </Label>
                                <p className="text-xs leading-6 text-muted-foreground">
                                    JPG، PNG یا WebP؛ هر فایل حداکثر ۵ مگابایت،
                                    حداکثر ۱۰ تصویر.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {lesson.images.map((image) => (
                                        <label
                                            key={image.path}
                                            className="space-y-2 rounded-lg border p-2"
                                        >
                                            <img
                                                src={image.url}
                                                className="aspect-square w-full rounded object-cover"
                                                alt="تصویر گالری لسن"
                                            />
                                            <span className="flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.remove_images.includes(
                                                        image.path,
                                                    )}
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'remove_images',
                                                            e.target.checked
                                                                ? [
                                                                      ...form
                                                                          .data
                                                                          .remove_images,
                                                                      image.path,
                                                                  ]
                                                                : form.data.remove_images.filter(
                                                                      (path) =>
                                                                          path !==
                                                                          image.path,
                                                                  ),
                                                        )
                                                    }
                                                />{' '}
                                                حذف این تصویر
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <Input
                                    id="lesson-images"
                                    key={`images-${uploadKey}`}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        form.setData(
                                            'image_files',
                                            Array.from(e.target.files ?? []),
                                        )
                                    }
                                />
                                <InputError message={form.errors.image_files} />
                            </div>
                            {overview.permissions.manage_commerce ? (
                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="text-sm font-semibold">
                                        قیمت لسن در هر پلن
                                    </h3>
                                    <p className="text-xs leading-6 text-muted-foreground">
                                        خالی: قیمت جداگانه تعریف نشده است. صفر:
                                        رایگان. قیمت‌ها به تومان هستند.
                                    </p>
                                    {plans.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            ابتدا در سربرگ اسپیس‌ها و پلن‌ها یک
                                            پلن بسازید.
                                        </p>
                                    )}
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className="space-y-2"
                                        >
                                            <Label
                                                htmlFor={`lesson-price-${plan.id}`}
                                            >
                                                {plan.spaceName} / {plan.name}
                                            </Label>
                                            <Input
                                                id={`lesson-price-${plan.id}`}
                                                type="number"
                                                min={0}
                                                max={4294967295}
                                                step={1}
                                                value={
                                                    form.data.prices[plan.id] ??
                                                    ''
                                                }
                                                placeholder="بدون قیمت جداگانه"
                                                onChange={(e) =>
                                                    form.setData('prices', {
                                                        ...form.data.prices,
                                                        [plan.id]:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    تنظیم قیمت لسن فقط برای مالک دوره فعال است.
                                </p>
                            )}
                        </>
                    )}
                    {Object.entries(form.errors)
                        .filter(
                            ([key]) =>
                                ![
                                    'name',
                                    'order',
                                    'thumbnail_file',
                                    'image_files',
                                ].includes(key),
                        )
                        .map(([key, message]) => (
                            <InputError key={key} message={message} />
                        ))}
                    {form.progress && (
                        <p
                            role="status"
                            className="text-xs text-muted-foreground"
                        >
                            بارگذاری: {form.progress.percentage}٪
                        </p>
                    )}
                    <Button className="w-full" type="submit">
                        {form.processing ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
                    </Button>
                    {form.recentlySuccessful && (
                        <p
                            role="status"
                            className="text-sm text-green-600 dark:text-green-400"
                        >
                            تغییرات ذخیره شدند.
                        </p>
                    )}
                </fieldset>
            </form>
            {overview.permissions.delete_structure && (
                <div className="space-y-2 border-t pt-4">
                    <Button
                        variant="destructive"
                        disabled={busy || blocked}
                        onClick={remove}
                    >
                        <Trash2 /> حذف {lesson ? 'لسن' : 'سکشن'}
                    </Button>
                    {blocked && (
                        <p className="text-xs leading-6 text-muted-foreground">
                            ابتدا {lesson ? 'محتواهای لسن' : 'لسن‌های سکشن'} را
                            حذف کنید.
                        </p>
                    )}
                    {deleteError && (
                        <p role="alert" className="text-sm text-destructive">
                            {deleteError}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
