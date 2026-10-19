import { useCourseEditorDirty } from '@/components/course-editor-state';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import courseRoutes from '@/routes/teacher/course';
import planRoutes from '@/routes/teacher/plan';
import spaceRoutes from '@/routes/teacher/space';
import type {
    CourseEditorOverview,
    CourseEditorPlan,
    CourseEditorSaveStatus,
    CourseEditorSpace,
} from '@/types/course-editor';
import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Target =
    | { kind: 'space'; item?: CourseEditorSpace }
    | { kind: 'plan'; spaceId: number; item?: CourseEditorPlan };

export default function CourseEditorSpaces({
    courseId,
    overview,
    onStatus,
}: {
    courseId: number;
    overview: CourseEditorOverview;
    onStatus: (status: CourseEditorSaveStatus) => void;
}) {
    const [target, setTarget] = useState<Target | null>(null);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const canManage = overview.permissions.manage_commerce;

    function choose(next: Target | null) {
        if (
            busy ||
            (dirty && !window.confirm('تغییرات ذخیره‌نشده کنار گذاشته شوند؟'))
        )
            return;
        setDirty(false);
        setTarget(next);
        setError('');
    }

    function remove(
        kind: 'space' | 'plan',
        item: CourseEditorSpace | CourseEditorPlan,
    ) {
        if (busy || !canManage || item.delete_block_reason) return;
        if (
            !window.confirm(`«${item.name}» حذف شود؟ این کار قابل بازگشت نیست.`)
        )
            return;
        setBusy(true);
        setError('');
        onStatus('saving');
        router.delete(
            kind === 'space'
                ? spaceRoutes.destroy.url(item.id)
                : planRoutes.destroy.url(item.id),
            {
                only: ['overview', 'errors'],
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    onStatus('saved');
                    if (target?.item?.id === item.id && target.kind === kind)
                        setTarget(null);
                },
                onError: (errors) => {
                    setError(Object.values(errors)[0] || 'حذف انجام نشد.');
                    onStatus('error');
                },
                onFinish: () => setBusy(false),
            },
        );
    }

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="font-semibold">اسپیس‌ها و پلن‌ها</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                    پلن‌های هر اسپیس و قیمت آن‌ها را در همین بخش مدیریت کنید.
                    قیمت‌ها به تومان هستند.
                </p>
            </div>
            {!canManage && (
                <p className="rounded-lg bg-muted p-3 text-sm">
                    مدیریت اسپیس، پلن و قیمت فقط برای مالک دوره فعال است.
                </p>
            )}
            {overview.spaces.length === 0 && (
                <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                    هنوز اسپیسی ایجاد نشده است.
                </p>
            )}
            {overview.spaces.map((space) => (
                <section
                    key={space.id}
                    className="min-w-0 rounded-xl border bg-background"
                >
                    <header className="flex items-start justify-between gap-2 border-b p-3">
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold break-words">
                                {space.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {space.plans.length} پلن
                                {space.quiz_id &&
                                    ` · آزمون شماره ${space.quiz_id}`}
                            </p>
                        </div>
                        {canManage && (
                            <div className="flex shrink-0">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={busy}
                                    aria-label={`ویرایش اسپیس ${space.name}`}
                                    onClick={() =>
                                        choose({ kind: 'space', item: space })
                                    }
                                >
                                    <Pencil />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={
                                        busy || !!space.delete_block_reason
                                    }
                                    title={
                                        space.delete_block_reason ?? 'حذف اسپیس'
                                    }
                                    aria-label={`حذف اسپیس ${space.name}`}
                                    onClick={() => remove('space', space)}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        )}
                    </header>
                    <div className="space-y-3 p-3">
                        {space.plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="rounded-lg bg-muted/40 p-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h4 className="text-sm break-words">
                                            {plan.name}
                                        </h4>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {plan.price === 0
                                                ? 'رایگان'
                                                : `${plan.price.toLocaleString('fa-IR')} تومان`}{' '}
                                            · ترتیب {plan.order}
                                        </p>
                                    </div>
                                    {canManage && (
                                        <div className="flex shrink-0">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                disabled={busy}
                                                aria-label={`ویرایش پلن ${plan.name}`}
                                                onClick={() =>
                                                    choose({
                                                        kind: 'plan',
                                                        spaceId: space.id,
                                                        item: plan,
                                                    })
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                disabled={
                                                    busy ||
                                                    !!plan.delete_block_reason
                                                }
                                                title={
                                                    plan.delete_block_reason ??
                                                    'حذف پلن'
                                                }
                                                aria-label={`حذف پلن ${plan.name}`}
                                                onClick={() =>
                                                    remove('plan', plan)
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {plan.delete_block_reason && (
                                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                                        {plan.delete_block_reason}
                                    </p>
                                )}
                            </div>
                        ))}
                        {canManage && (
                            <Button
                                className="w-full"
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                    choose({ kind: 'plan', spaceId: space.id })
                                }
                            >
                                <Plus /> افزودن پلن
                            </Button>
                        )}
                        {space.delete_block_reason && (
                            <p className="text-xs leading-6 text-muted-foreground">
                                {space.delete_block_reason}
                            </p>
                        )}
                    </div>
                </section>
            ))}
            {canManage && (
                <Button
                    className="w-full"
                    variant="outline"
                    disabled={busy}
                    onClick={() => choose({ kind: 'space' })}
                >
                    <Plus /> ایجاد اسپیس جدید
                </Button>
            )}
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            {canManage && target && (
                <CommerceForm
                    key={`${target.kind}-${target.item?.id ?? ('spaceId' in target ? target.spaceId : 'new')}`}
                    target={target}
                    courseId={courseId}
                    quizzes={overview.available_quizzes}
                    onClose={() => {
                        setDirty(false);
                        setTarget(null);
                    }}
                    onStatus={onStatus}
                    onDirty={setDirty}
                    onBusy={setBusy}
                />
            )}
        </div>
    );
}

function CommerceForm({
    target,
    courseId,
    quizzes,
    onClose,
    onStatus,
    onDirty,
    onBusy,
}: {
    target: Target;
    courseId: number;
    quizzes: CourseEditorOverview['available_quizzes'];
    onClose: () => void;
    onStatus: (status: CourseEditorSaveStatus) => void;
    onDirty: (dirty: boolean) => void;
    onBusy: (busy: boolean) => void;
}) {
    const form = useForm({
        name: target.item?.name ?? '',
        price: target.kind === 'plan' ? String(target.item?.price ?? '') : '',
        order: target.kind === 'plan' ? String(target.item?.order ?? '') : '',
        quiz_id:
            target.kind === 'space' ? String(target.item?.quiz_id ?? '') : '',
    });
    useCourseEditorDirty(form.isDirty);
    const firstInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
        firstInput.current?.focus();
        firstInput.current?.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
        });
    }, []);
    useEffect(() => {
        onDirty(form.isDirty);
    }, [form.isDirty, onDirty]);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        if (form.processing) return;
        const options = {
            only: ['overview', 'errors'],
            preserveScroll: true,
            preserveState: true,
            onStart: () => {
                onBusy(true);
                onStatus('saving');
            },
            onSuccess: () => {
                onStatus('saved');
                onClose();
            },
            onError: () => onStatus('error'),
            onFinish: () => onBusy(false),
        };
        form.transform((data) =>
            target.kind === 'space'
                ? { name: data.name, quiz_id: data.quiz_id || null }
                : {
                      name: data.name,
                      price: data.price,
                      ...(target.item ? { order: data.order } : {}),
                  },
        );
        if (target.item)
            form.put(
                target.kind === 'space'
                    ? spaceRoutes.update.url(target.item.id)
                    : planRoutes.update.url(target.item.id),
                options,
            );
        else
            form.post(
                target.kind === 'space'
                    ? courseRoutes.space.store.url(courseId)
                    : spaceRoutes.plan.store.url(target.spaceId),
                options,
            );
    }

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-xl border border-primary/40 bg-background p-4"
            aria-label={target.kind === 'space' ? 'فرم اسپیس' : 'فرم پلن'}
        >
            <h3 className="text-sm font-semibold">
                {target.item ? 'ویرایش' : 'ایجاد'}{' '}
                {target.kind === 'space' ? 'اسپیس' : 'پلن'}
            </h3>
            <fieldset disabled={form.processing} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="commerce-name">
                        نام {target.kind === 'space' ? 'اسپیس' : 'پلن'}
                    </Label>
                    <Input
                        ref={firstInput}
                        id="commerce-name"
                        value={form.data.name}
                        maxLength={255}
                        required
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                    <InputError message={form.errors.name} />
                </div>
                {target.kind === 'space' ? (
                    <div className="space-y-2">
                        <Label htmlFor="commerce-quiz">
                            آزمون مرتبط (اختیاری)
                        </Label>
                        <select
                            id="commerce-quiz"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={form.data.quiz_id}
                            onChange={(e) =>
                                form.setData('quiz_id', e.target.value)
                            }
                        >
                            <option value="">بدون آزمون</option>
                            {quizzes.map((quiz) => (
                                <option key={quiz.id} value={quiz.id}>
                                    آزمون {quiz.id} · نمره {quiz.score}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.quiz_id} />
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="commerce-price">
                                قیمت پلن (تومان)
                            </Label>
                            <Input
                                id="commerce-price"
                                type="number"
                                min={0}
                                max={4294967295}
                                step={1}
                                required
                                value={form.data.price}
                                onChange={(e) =>
                                    form.setData('price', e.target.value)
                                }
                            />
                            <InputError message={form.errors.price} />
                        </div>
                        {target.item && (
                            <div className="space-y-2">
                                <Label htmlFor="commerce-order">ترتیب</Label>
                                <Input
                                    id="commerce-order"
                                    type="number"
                                    min={0}
                                    max={32767}
                                    step={1}
                                    required
                                    value={form.data.order}
                                    onChange={(e) =>
                                        form.setData('order', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.order} />
                            </div>
                        )}
                    </>
                )}
                <div className="flex flex-wrap gap-2">
                    <Button type="submit">
                        {form.processing ? 'در حال ذخیره…' : 'ذخیره'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (
                                !form.isDirty ||
                                window.confirm(
                                    'تغییرات ذخیره‌نشده کنار گذاشته شوند؟',
                                )
                            )
                                onClose();
                        }}
                    >
                        انصراف
                    </Button>
                </div>
            </fieldset>
        </form>
    );
}
