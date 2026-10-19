import { useCourseEditorDirty } from '@/components/course-editor-state';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { information, teachers } from '@/routes/teacher/course/editor';
import type {
    CourseEditorCourse,
    CourseEditorOverview,
    CourseEditorSaveStatus,
    CourseTeacherRole,
} from '@/types/course-editor';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Save, Trash2, Users } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

const roleLabels: Record<CourseTeacherRole, string> = {
    owner: 'مالک دوره',
    instructor: 'مدرس',
    assistant: 'دستیار',
    reviewer: 'بازبین',
    editor: 'ویراستار',
};

function informationValues(
    course: CourseEditorCourse,
    overview: CourseEditorOverview,
) {
    return {
        title: course.title,
        slug: overview.slug,
        description: overview.description ?? '',
        thumbnail: overview.thumbnail ?? '',
        intro_video_url: overview.intro_video_url ?? '',
        is_published: course.is_published,
    };
}

export default function CourseEditorInformation({
    course,
    overview,
    onStatus,
}: {
    course: CourseEditorCourse;
    overview: CourseEditorOverview;
    onStatus: (status: CourseEditorSaveStatus) => void;
}) {
    const form = useForm(informationValues(course, overview));
    useCourseEditorDirty(form.isDirty);
    const canEdit = overview.permissions.update_information;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canEdit || form.processing) {
            return;
        }
        form.transform((data) => {
            if (overview.permissions.publish) {
                return data;
            }
            return {
                title: data.title,
                slug: data.slug,
                description: data.description,
                thumbnail: data.thumbnail,
                intro_video_url: data.intro_video_url,
            };
        });
        form.patch(information(course.id).url, {
            only: ['course', 'overview'],
            preserveScroll: true,
            errorBag: 'courseInformation',
            onStart: () => onStatus('saving'),
            onError: () => onStatus('error'),
            onSuccess: (page) => {
                if (page.component !== 'teacher/course/editor') {
                    return;
                }
                const saved = page.props as unknown as {
                    course: CourseEditorCourse;
                    overview: CourseEditorOverview;
                };
                const values = informationValues(saved.course, saved.overview);
                form.setData(values);
                form.setDefaults(values);
                onStatus('saved');
            },
        });
    }

    return (
        <div className="space-y-7">
            <div>
                <h2 className="font-semibold">اطلاعات دوره</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    مشخصات دوره و مدرس‌های آن
                </p>
                {!overview.has_owner && (
                    <p
                        role="status"
                        className="mt-3 rounded-lg border border-amber-500/40 p-3 text-sm leading-7"
                    >
                        این دوره مالک ندارد. تعیین مالک باید از مسیر مدیریت مجاز
                        انجام شود؛ انتشار و مدیریت مدرس‌ها در این صفحه فعال
                        نیست.
                    </p>
                )}
                {!canEdit && (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        سمت شما اجازهٔ ویرایش اطلاعات دوره را ندارد.
                    </p>
                )}
            </div>
            <form
                onSubmit={submit}
                className="space-y-4"
                aria-label="اطلاعات دوره"
                onChange={() => onStatus('dirty')}
            >
                <fieldset
                    disabled={!canEdit || form.processing}
                    className="space-y-4"
                >
                    <Field
                        label="عنوان دوره"
                        id="editor-title"
                        error={form.errors.title}
                    >
                        <Input
                            id="editor-title"
                            name="title"
                            value={form.data.title}
                            maxLength={255}
                            required
                            aria-invalid={!!form.errors.title}
                            aria-describedby={
                                form.errors.title
                                    ? 'editor-title-error'
                                    : undefined
                            }
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="شناسه متنی"
                        id="editor-slug"
                        error={form.errors.slug}
                    >
                        <Input
                            id="editor-slug"
                            name="slug"
                            dir="auto"
                            value={form.data.slug}
                            maxLength={255}
                            required
                            aria-invalid={!!form.errors.slug}
                            aria-describedby={
                                form.errors.slug
                                    ? 'editor-slug-error'
                                    : undefined
                            }
                            onChange={(event) =>
                                form.setData('slug', event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="توضیحات"
                        id="editor-description"
                        error={form.errors.description}
                    >
                        <Textarea
                            id="editor-description"
                            name="description"
                            dir="auto"
                            rows={5}
                            maxLength={4096}
                            value={form.data.description}
                            aria-invalid={!!form.errors.description}
                            aria-describedby={
                                form.errors.description
                                    ? 'editor-description-error'
                                    : undefined
                            }
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="نشانی تصویر دوره"
                        id="editor-thumbnail"
                        error={form.errors.thumbnail}
                    >
                        <Input
                            id="editor-thumbnail"
                            name="thumbnail"
                            dir="ltr"
                            value={form.data.thumbnail}
                            maxLength={255}
                            placeholder="https://…"
                            aria-invalid={!!form.errors.thumbnail}
                            aria-describedby={
                                form.errors.thumbnail
                                    ? 'editor-thumbnail-error'
                                    : undefined
                            }
                            onChange={(event) =>
                                form.setData('thumbnail', event.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="نشانی ویدئوی معرفی"
                        id="editor-intro"
                        error={form.errors.intro_video_url}
                    >
                        <Input
                            id="editor-intro"
                            name="intro_video_url"
                            dir="ltr"
                            value={form.data.intro_video_url}
                            maxLength={255}
                            placeholder="https://…"
                            aria-invalid={!!form.errors.intro_video_url}
                            aria-describedby={
                                form.errors.intro_video_url
                                    ? 'editor-intro-error'
                                    : undefined
                            }
                            onChange={(event) =>
                                form.setData(
                                    'intro_video_url',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <p className="text-xs leading-6 text-muted-foreground">
                        برای تغییر رسانه، نشانی http یا https وارد کنید.
                        بارگذاری فایل در مراحل بعد اضافه می‌شود.
                    </p>
                    <Field
                        label="وضعیت انتشار"
                        id="editor-publication"
                        error={form.errors.is_published}
                    >
                        <Select
                            dir="rtl"
                            disabled={
                                !overview.permissions.publish || form.processing
                            }
                            value={
                                form.data.is_published ? 'published' : 'draft'
                            }
                            onValueChange={(value) => {
                                form.setData(
                                    'is_published',
                                    value === 'published',
                                );
                                onStatus('dirty');
                            }}
                        >
                            <SelectTrigger
                                id="editor-publication"
                                aria-invalid={!!form.errors.is_published}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">پیش‌نویس</SelectItem>
                                <SelectItem value="published">
                                    منتشرشده
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {!overview.permissions.publish && (
                            <p className="text-xs text-muted-foreground">
                                تغییر وضعیت انتشار فقط در اختیار مالک است.
                            </p>
                        )}
                    </Field>
                </fieldset>
                {canEdit && (
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.processing || !form.isDirty}
                    >
                        {form.processing ? (
                            <LoaderCircle
                                className="animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <Save aria-hidden="true" />
                        )}
                        ذخیره اطلاعات دوره
                    </Button>
                )}
                <FormFeedback
                    successful={form.recentlySuccessful && !form.isDirty}
                    hasErrors={form.hasErrors}
                />
            </form>
            <TeacherSettings
                course={course}
                overview={overview}
                onStatus={onStatus}
            />
        </div>
    );
}

function TeacherSettings({
    course,
    overview,
    onStatus,
}: {
    course: CourseEditorCourse;
    overview: CourseEditorOverview;
    onStatus: (status: CourseEditorSaveStatus) => void;
}) {
    const form = useForm<{
        teachers: { id: number; role: CourseTeacherRole }[];
    }>({ teachers: overview.teachers.map(({ id, role }) => ({ id, role })) });
    useCourseEditorDirty(form.isDirty);
    const [candidate, setCandidate] = useState('');
    const canManage = overview.permissions.manage_teachers;
    const ownerCount = form.data.teachers.filter(
        (teacher) => teacher.role === 'owner',
    ).length;
    const choices = overview.available_teachers.filter(
        (teacher) => !form.data.teachers.some((row) => row.id === teacher.id),
    );
    const names = new Map(
        [...overview.available_teachers, ...overview.teachers].map(
            (teacher) => [teacher.id, teacher.name],
        ),
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canManage || form.processing) {
            return;
        }
        form.put(teachers(course.id).url, {
            only: ['course', 'overview'],
            preserveScroll: true,
            errorBag: 'courseTeachers',
            onStart: () => onStatus('saving'),
            onError: () => onStatus('error'),
            onSuccess: (page) => {
                const saved = page.props.overview as
                    | CourseEditorOverview
                    | undefined;
                if (saved) {
                    const values = {
                        teachers: saved.teachers.map(({ id, role }) => ({
                            id,
                            role,
                        })),
                    };
                    form.setData(values);
                    form.setDefaults(values);
                }
                onStatus('saved');
            },
        });
    }

    return (
        <form
            onSubmit={submit}
            aria-label="مدرس‌های دوره"
            className="space-y-4 border-t pt-5"
        >
            <h3 className="flex items-center gap-2 font-semibold">
                <Users className="size-4" aria-hidden="true" />
                مدرس‌های دوره
            </h3>
            {!canManage && (
                <p className="text-xs leading-6 text-muted-foreground">
                    مدیریت مدرس‌ها و سمت‌ها فقط در اختیار مالک دوره است.
                </p>
            )}
            <ul className="space-y-3">
                {form.data.teachers.map((teacher, index) => {
                    const lastOwner =
                        teacher.role === 'owner' && ownerCount === 1;
                    return (
                        <li
                            key={teacher.id}
                            className="space-y-3 rounded-lg bg-muted/50 p-3 text-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="min-w-0 break-words">
                                    {names.get(teacher.id)}
                                </span>
                                {canManage ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={form.processing || lastOwner}
                                        aria-label={`حذف ${names.get(teacher.id)} از دوره`}
                                        onClick={() => {
                                            form.clearErrors();
                                            form.setData(
                                                'teachers',
                                                form.data.teachers.filter(
                                                    (row) =>
                                                        row.id !== teacher.id,
                                                ),
                                            );
                                            onStatus('dirty');
                                        }}
                                    >
                                        <Trash2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        {roleLabels[teacher.role]}
                                    </span>
                                )}
                            </div>
                            {canManage && (
                                <Field
                                    label="سمت مدرس"
                                    id={`editor-role-${teacher.id}`}
                                    error={
                                        form.errors[`teachers.${index}.role`]
                                    }
                                >
                                    <Select
                                        dir="rtl"
                                        value={teacher.role}
                                        disabled={form.processing || lastOwner}
                                        onValueChange={(value) => {
                                            form.clearErrors();
                                            form.setData(
                                                'teachers',
                                                form.data.teachers.map((row) =>
                                                    row.id === teacher.id
                                                        ? {
                                                              ...row,
                                                              role: value as CourseTeacherRole,
                                                          }
                                                        : row,
                                                ),
                                            );
                                            onStatus('dirty');
                                        }}
                                    >
                                        <SelectTrigger
                                            id={`editor-role-${teacher.id}`}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(roleLabels).map(
                                                ([role, label]) => (
                                                    <SelectItem
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                            <InputError
                                message={form.errors[`teachers.${index}.id`]}
                            />
                            <InputError
                                message={form.errors[`teachers.${index}`]}
                            />
                            {canManage && lastOwner && (
                                <p className="text-xs leading-6 text-muted-foreground">
                                    برای حذف یا تغییر سمت این مالک، ابتدا مالک
                                    دیگری اضافه کنید.
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
            {canManage && (
                <>
                    <Field label="افزودن مدرس" id="editor-add-teacher">
                        <Select
                            dir="rtl"
                            value={candidate}
                            disabled={form.processing || choices.length === 0}
                            onValueChange={setCandidate}
                        >
                            <SelectTrigger id="editor-add-teacher">
                                <SelectValue
                                    placeholder={
                                        choices.length
                                            ? 'یک مدرس انتخاب کنید'
                                            : 'مدرس دیگری در دسترس نیست'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {choices.map((teacher) => (
                                    <SelectItem
                                        key={teacher.id}
                                        value={String(teacher.id)}
                                    >
                                        {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={!candidate || form.processing}
                        onClick={() => {
                            const teacher = choices.find(
                                (item) => String(item.id) === candidate,
                            );
                            if (teacher) {
                                form.clearErrors();
                                form.setData('teachers', [
                                    ...form.data.teachers,
                                    { id: teacher.id, role: 'instructor' },
                                ]);
                                setCandidate('');
                                onStatus('dirty');
                            }
                        }}
                    >
                        <Plus aria-hidden="true" />
                        افزودن به فهرست
                    </Button>
                    <p className="text-xs leading-6 text-muted-foreground">
                        تغییرات فهرست پس از ذخیره اعمال می‌شوند. اگر عضویت خود
                        را حذف کنید، به فهرست دوره‌ها برمی‌گردید.
                    </p>
                    <InputError message={form.errors.teachers} />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.processing || !form.isDirty}
                    >
                        {form.processing ? (
                            <LoaderCircle
                                className="animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <Save aria-hidden="true" />
                        )}
                        ذخیره مدرس‌ها
                    </Button>
                </>
            )}
            <FormFeedback
                successful={form.recentlySuccessful && !form.isDirty}
                hasErrors={form.hasErrors}
            />
        </form>
    );
}

function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            <InputError id={`${id}-error`} message={error} />
        </div>
    );
}

function FormFeedback({
    successful,
    hasErrors,
}: {
    successful: boolean;
    hasErrors: boolean;
}) {
    if (hasErrors) {
        return (
            <p role="alert" className="text-sm leading-7 text-destructive">
                ذخیره انجام نشد. خطاهای مشخص‌شده را اصلاح کنید.
            </p>
        );
    }
    return successful ? (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
            تغییرات ذخیره شدند.
        </p>
    ) : null;
}
