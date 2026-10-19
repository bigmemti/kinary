import CourseEditorInformation from '@/components/course-editor-information';
import CourseEditorItemForm from '@/components/course-editor-item-form';
import CourseEditorSpaces from '@/components/course-editor-spaces';
import {
    CourseEditorState,
    useCourseEditorState,
} from '@/components/course-editor-state';
import CourseEditorStructure from '@/components/course-editor-structure';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CourseEditorLayout from '@/layouts/course-editor-layout';
import { cn } from '@/lib/utils';
import course_link, { editor } from '@/routes/teacher/course';
import lessonRoutes from '@/routes/teacher/lesson';
import section_link from '@/routes/teacher/section';
import type {
    CourseEditorCourse,
    CourseEditorOverview,
    CourseEditorSaveStatus,
    CourseEditorSelection,
    CourseEditorTab,
} from '@/types/course-editor';
import { Deferred, Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Cloud,
    FileText,
    Layers3,
    Plus,
    RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const tabs = [
    { id: 'information', label: 'اطلاعات دوره', icon: FileText },
    { id: 'spaces', label: 'اسپیس‌ها و پلن‌ها', icon: Cloud },
    { id: 'content', label: 'محتوا', icon: Layers3 },
] satisfies { id: CourseEditorTab; label: string; icon: typeof FileText }[];

export default function Editor(props: {
    course: CourseEditorCourse;
    overview?: CourseEditorOverview;
}) {
    return (
        <CourseEditorState key={props.course.id}>
            <EditorWorkspace {...props} />
        </CourseEditorState>
    );
}

function EditorWorkspace({
    course,
    overview,
}: {
    course: CourseEditorCourse;
    overview?: CourseEditorOverview;
}) {
    const editorState = useCourseEditorState();
    const [activeTab, setActiveTab] = useState<CourseEditorTab>('information');
    const [selection, setSelection] = useState<CourseEditorSelection | null>(
        null,
    );
    const [loadFailed, setLoadFailed] = useState(false);
    const [saveStatus, setSaveStatus] =
        useState<CourseEditorSaveStatus>('idle');
    const [retrying, setRetrying] = useState(false);
    const itemDirty = useRef(false);
    const setItemDirty = useCallback((dirty: boolean) => {
        itemDirty.current = dirty;
    }, []);
    const [actionBusy, setActionBusy] = useState(false);
    const [actionError, setActionError] = useState('');
    const actionLock = useRef(false);
    const mutationActive = useRef(false);
    const reportStatus = useCallback((next: CourseEditorSaveStatus) => {
        mutationActive.current = next === 'saving';
        setSaveStatus(next);
    }, []);
    const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        function isOverviewRequest(value: unknown) {
            const config = (
                value as {
                    config?: {
                        url?: string;
                        headers?: Record<string, unknown>;
                    };
                }
            )?.config;

            return (
                config?.url !== undefined &&
                new URL(config.url, window.location.origin).pathname ===
                    editor(course.id).url &&
                String(config.headers?.['X-Inertia-Partial-Data'] ?? '')
                    .split(',')
                    .includes('overview')
            );
        }

        const removeInvalidListener = router.on('invalid', (event) => {
            if (isOverviewRequest(event.detail.response)) {
                setLoadFailed(true);
                return false;
            }
            const url = event.detail.response.config?.url;
            if (
                mutationActive.current ||
                (url &&
                    new URL(url, window.location.origin).pathname.startsWith(
                        `${editor(course.id).url}/`,
                    ))
            ) {
                reportStatus('error');
                return false;
            }
        });
        const removeExceptionListener = router.on('exception', (event) => {
            if (isOverviewRequest(event.detail.exception)) {
                setLoadFailed(true);
                return false;
            }
            const url = (
                event.detail.exception as { config?: { url?: string } }
            ).config?.url;
            if (
                mutationActive.current ||
                (url &&
                    new URL(url, window.location.origin).pathname.startsWith(
                        `${editor(course.id).url}/`,
                    ))
            ) {
                reportStatus('error');
                return false;
            }
        });

        return () => {
            removeInvalidListener();
            removeExceptionListener();
        };
    }, [course.id, reportStatus]);

    function retryOverview() {
        setLoadFailed(false);
        setRetrying(true);
        router.reload({
            only: ['overview'],
            onError: () => setLoadFailed(true),
            onFinish: () => setRetrying(false),
        });
    }

    const saveLabels: Record<CourseEditorSaveStatus, string> = {
        idle: 'اطلاعات دوره دریافت شد',
        dirty: 'تغییرات ذخیره‌نشده دارید',
        saving: 'در حال ذخیره…',
        saved: 'تغییرات ذخیره شدند',
        error: 'ذخیره انجام نشد',
    };
    const status = loadFailed
        ? 'دریافت اطلاعات ناموفق بود'
        : !overview || retrying
          ? 'در حال دریافت اطلاعات…'
          : saveLabels[
                saveStatus === 'saved' ||
                saveStatus === 'idle' ||
                saveStatus === 'dirty'
                    ? editorState.dirty
                        ? 'dirty'
                        : saveStatus === 'dirty'
                          ? 'idle'
                          : saveStatus
                    : saveStatus
            ];

    function selectItem(item: CourseEditorSelection) {
        if (actionBusy || editorState.busy) return;
        if (
            selection?.kind === item.kind &&
            selection.sectionId === item.sectionId &&
            (!('lessonId' in item) ||
                ('lessonId' in selection &&
                    selection.lessonId === item.lessonId)) &&
            (!('contentId' in item) ||
                ('contentId' in selection &&
                    selection.contentId === item.contentId))
        ) {
            setActiveTab('content');
            return;
        }
        if (
            itemDirty.current &&
            !window.confirm('تغییرات ذخیره‌نشده کنار گذاشته شوند؟')
        )
            return;
        itemDirty.current = false;
        setSelection(item);
        setActiveTab('content');
    }

    function createContent(sectionId: number, lessonId: number) {
        if (
            actionLock.current ||
            editorState.busy ||
            !overview?.permissions.update_structure
        )
            return;
        if (
            itemDirty.current &&
            !window.confirm('تغییرات ذخیره‌نشده کنار گذاشته شوند؟')
        )
            return;
        actionLock.current = true;
        setActionBusy(true);
        setActionError('');
        reportStatus('saving');
        router.post(
            lessonRoutes.editor.contents.store.url(lessonId),
            { type: 'text', body: 'محتوای جدید' },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['overview', 'createdItem', 'errors'],
                onSuccess: (page) => {
                    const created = page.props.createdItem as {
                        kind: string;
                        id: number;
                        parent_id: number;
                    } | null;
                    if (created?.kind === 'content') {
                        itemDirty.current = false;
                        setSelection({
                            kind: 'content',
                            sectionId,
                            lessonId: created.parent_id,
                            contentId: created.id,
                        });
                        setActiveTab('content');
                    }
                    reportStatus('saved');
                },
                onError: (errors) => {
                    setActionError(
                        Object.values(errors)[0] ||
                            'ساخت محتوا انجام نشد. دوباره تلاش کنید.',
                    );
                    reportStatus('error');
                },
                onFinish: () => {
                    actionLock.current = false;
                    setActionBusy(false);
                },
            },
        );
    }

    function createItem(sectionId?: number) {
        if (
            actionLock.current ||
            editorState.busy ||
            !overview?.permissions.update_structure
        )
            return;
        if (
            itemDirty.current &&
            !window.confirm('تغییرات ذخیره‌نشده کنار گذاشته شوند؟')
        )
            return;
        actionLock.current = true;
        setActionBusy(true);
        setActionError('');
        reportStatus('saving');
        const kind = sectionId === undefined ? 'section' : 'lesson';
        router.post(
            sectionId === undefined
                ? course_link.section.store.url(course.id)
                : section_link.lesson.store.url(sectionId),
            { name: kind === 'section' ? 'سکشن جدید' : 'لسن جدید' },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['overview', 'createdItem', 'errors'],
                onSuccess: (page) => {
                    const created = page.props.createdItem as {
                        kind: string;
                        id: number;
                        parent_id: number;
                    } | null;
                    if (created?.kind === kind) {
                        itemDirty.current = false;
                        setSelection(
                            kind === 'section'
                                ? { kind: 'section', sectionId: created.id }
                                : {
                                      kind: 'lesson',
                                      sectionId: created.parent_id,
                                      lessonId: created.id,
                                  },
                        );
                        setActiveTab('content');
                    }
                    reportStatus('saved');
                },
                onError: (errors) => {
                    setActionError(
                        Object.values(errors)[0] ||
                            'ساخت آیتم انجام نشد. دوباره تلاش کنید.',
                    );
                    reportStatus('error');
                },
                onFinish: () => {
                    actionLock.current = false;
                    setActionBusy(false);
                },
            },
        );
    }

    return (
        <>
            <Head title={`ویرایشگر دوره · ${course.title}`} />
            <CourseEditorLayout
                course={course}
                status={status}
                sidebar={
                    <>
                        <div
                            role="tablist"
                            aria-label="بخش‌های ویرایشگر دوره"
                            className="grid shrink-0 grid-cols-3 border-b p-2"
                        >
                            {tabs.map((tab, tabIndex) => (
                                <button
                                    key={tab.id}
                                    ref={(element) => {
                                        tabButtons.current[tabIndex] = element;
                                    }}
                                    type="button"
                                    role="tab"
                                    id={`editor-tab-${tab.id}`}
                                    aria-controls={`editor-panel-${tab.id}`}
                                    aria-selected={activeTab === tab.id}
                                    tabIndex={activeTab === tab.id ? 0 : -1}
                                    className={cn(
                                        'flex flex-col items-center gap-2 rounded-lg px-1 py-3 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                    onClick={() => setActiveTab(tab.id)}
                                    onKeyDown={(event) => {
                                        let nextTabIndex = tabIndex;
                                        if (event.key === 'ArrowLeft') {
                                            nextTabIndex =
                                                (tabIndex + 1) % tabs.length;
                                        } else if (event.key === 'ArrowRight') {
                                            nextTabIndex =
                                                (tabIndex + tabs.length - 1) %
                                                tabs.length;
                                        } else if (event.key === 'Home') {
                                            nextTabIndex = 0;
                                        } else if (event.key === 'End') {
                                            nextTabIndex = tabs.length - 1;
                                        } else {
                                            return;
                                        }
                                        event.preventDefault();
                                        setActiveTab(tabs[nextTabIndex].id);
                                        tabButtons.current[
                                            nextTabIndex
                                        ]?.focus();
                                    }}
                                >
                                    <tab.icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <section
                            scroll-region=""
                            role="tabpanel"
                            id={`editor-panel-${activeTab}`}
                            aria-labelledby={`editor-tab-${activeTab}`}
                            tabIndex={0}
                            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-5"
                        >
                            <fieldset
                                disabled={editorState.busy}
                                className="min-w-0"
                            >
                                {saveStatus === 'error' && (
                                    <p
                                        role="alert"
                                        className="mb-4 rounded-lg border border-destructive/30 p-3 text-sm leading-7 text-destructive"
                                    >
                                        ذخیره انجام نشد. خطاهای فرم و اتصال را
                                        بررسی کنید و دوباره تلاش کنید.
                                    </p>
                                )}
                                {loadFailed ? (
                                    <LoadError
                                        onRetry={retryOverview}
                                        retrying={retrying}
                                    />
                                ) : (
                                    <Deferred
                                        data="overview"
                                        fallback={<OverviewSkeleton />}
                                    >
                                        {overview && (
                                            <SidebarPanel
                                                activeTab={activeTab}
                                                course={course}
                                                overview={overview}
                                                selection={selection}
                                                onStatus={reportStatus}
                                                onDirty={setItemDirty}
                                                onDeleted={() =>
                                                    setSelection(null)
                                                }
                                            />
                                        )}
                                    </Deferred>
                                )}
                            </fieldset>
                        </section>
                    </>
                }
            >
                {loadFailed ? (
                    <LoadError onRetry={retryOverview} retrying={retrying} />
                ) : (
                    <Deferred data="overview" fallback={<CanvasSkeleton />}>
                        {overview && (
                            <div className="mx-auto max-w-4xl space-y-5">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                                    <div>
                                        <h2 className="font-semibold">
                                            ساختار آموزشی دوره
                                        </h2>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {overview.sections.length} سکشن ·
                                            برای ویرایش، آیتم را انتخاب کنید.
                                        </p>
                                    </div>
                                    {overview.permissions.update_structure && (
                                        <Button
                                            size="sm"
                                            onClick={() => createItem()}
                                            disabled={
                                                actionBusy || editorState.busy
                                            }
                                        >
                                            <Plus /> افزودن سکشن
                                        </Button>
                                    )}
                                </div>
                                {actionError && (
                                    <p
                                        role="alert"
                                        className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
                                    >
                                        {actionError}
                                    </p>
                                )}
                                {overview.sections.length > 0 ? (
                                    <CourseEditorStructure
                                        sections={overview.sections}
                                        selection={selection}
                                        onSelect={selectItem}
                                        onCreateLesson={
                                            overview.permissions
                                                .update_structure
                                                ? (id) => createItem(id)
                                                : undefined
                                        }
                                        onCreateContent={
                                            overview.permissions
                                                .update_structure
                                                ? createContent
                                                : undefined
                                        }
                                        busy={actionBusy || editorState.busy}
                                    />
                                ) : (
                                    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            دوره هنوز سکشن ندارد.
                                        </p>
                                        {overview.permissions
                                            .update_structure && (
                                            <Button
                                                onClick={() => createItem()}
                                                disabled={
                                                    actionBusy ||
                                                    editorState.busy
                                                }
                                            >
                                                <Plus /> ایجاد اولین سکشن
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </Deferred>
                )}
            </CourseEditorLayout>
        </>
    );
}

function SidebarPanel({
    activeTab,
    course,
    overview,
    selection,
    onStatus,
    onDirty,
    onDeleted,
}: {
    activeTab: CourseEditorTab;
    course: CourseEditorCourse;
    overview: CourseEditorOverview;
    selection: CourseEditorSelection | null;
    onStatus: (status: CourseEditorSaveStatus) => void;
    onDirty: (dirty: boolean) => void;
    onDeleted: () => void;
}) {
    return (
        <>
            <div hidden={activeTab !== 'information'}>
                <CourseEditorInformation
                    course={course}
                    overview={overview}
                    onStatus={onStatus}
                />
            </div>
            <div hidden={activeTab !== 'spaces'}>
                <CourseEditorSpaces
                    courseId={course.id}
                    overview={overview}
                    onStatus={onStatus}
                />
            </div>
            <div hidden={activeTab !== 'content'}>
                <CourseEditorItemForm
                    overview={overview}
                    selection={selection}
                    onStatus={onStatus}
                    onDirty={onDirty}
                    onDeleted={onDeleted}
                />
            </div>
        </>
    );
}

function LoadError({
    onRetry,
    retrying,
}: {
    onRetry: () => void;
    retrying: boolean;
}) {
    return (
        <div
            role="alert"
            className="rounded-xl border border-destructive/20 bg-card p-5"
        >
            <AlertCircle
                className="mb-3 size-5 text-destructive"
                aria-hidden="true"
            />
            <h2 className="font-semibold">اطلاعات دوره دریافت نشد</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                اتصال خود را بررسی کنید و دوباره تلاش کنید.
            </p>
            <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={onRetry}
                disabled={retrying}
            >
                <RefreshCw
                    className={cn(retrying && 'animate-spin')}
                    aria-hidden="true"
                />
                تلاش مجدد
            </Button>
        </div>
    );
}

function OverviewSkeleton() {
    return (
        <div
            role="status"
            aria-label="در حال دریافت اطلاعات دوره"
            className="space-y-5"
        >
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
}

function CanvasSkeleton() {
    return (
        <div
            role="status"
            aria-label="در حال دریافت ساختار دوره"
            className="mx-auto max-w-4xl space-y-6"
        >
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    );
}
