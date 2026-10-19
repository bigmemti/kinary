import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type {
    CourseEditorContent,
    CourseEditorSection,
    CourseEditorSelection,
} from '@/types/course-editor';
import { BookOpen, ChevronDown, FileText, Layers3, Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const contentTypeLabels: Record<CourseEditorContent['type'], string> = {
    text: 'متن',
    image: 'تصویر',
    video: 'ویدئو',
    file: 'فایل',
    table: 'جدول',
    remind: 'ارجاع / یادآوری',
    unknown: 'نوع ناشناخته',
};

export default function CourseEditorStructure({
    sections,
    selection,
    onSelect,
    onCreateLesson,
    onCreateContent,
    busy = false,
}: {
    sections: CourseEditorSection[];
    selection: CourseEditorSelection | null;
    onSelect: (selection: CourseEditorSelection) => void;
    onCreateLesson?: (sectionId: number) => void;
    onCreateContent?: (sectionId: number, lessonId: number) => void;
    busy?: boolean;
}) {
    return (
        <ul aria-label="ساختار دوره" className="space-y-4">
            {sections.map((section) => (
                <li key={section.id}>
                    <StructureGroup
                        label={section.name}
                        reveal={
                            selection?.sectionId === section.id
                                ? `${selection.kind}-${'lessonId' in selection ? selection.lessonId : section.id}`
                                : undefined
                        }
                        count={`${section.lessons.length} لسن`}
                        selected={
                            selection?.kind === 'section' &&
                            selection.sectionId === section.id
                        }
                        icon={
                            <Layers3
                                className="size-4 shrink-0"
                                aria-hidden="true"
                            />
                        }
                        onSelect={() =>
                            onSelect({ kind: 'section', sectionId: section.id })
                        }
                    >
                        {onCreateLesson && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mb-4"
                                disabled={busy}
                                onClick={() => onCreateLesson(section.id)}
                            >
                                <Plus /> افزودن لسن به این سکشن
                            </Button>
                        )}
                        {section.lessons.length === 0 ? (
                            <EmptyBranch>این سکشن هنوز لسن ندارد.</EmptyBranch>
                        ) : (
                            <ul className="space-y-3 border-s ps-4">
                                {section.lessons.map((lesson) => (
                                    <li key={lesson.id}>
                                        <StructureGroup
                                            reveal={
                                                selection?.kind === 'content' &&
                                                selection.lessonId === lesson.id
                                                    ? String(
                                                          selection.contentId,
                                                      )
                                                    : undefined
                                            }
                                            label={lesson.name}
                                            count={`${lesson.contents.length} محتوا`}
                                            selected={
                                                selection?.kind === 'lesson' &&
                                                selection.sectionId ===
                                                    section.id &&
                                                selection.lessonId === lesson.id
                                            }
                                            icon={
                                                <BookOpen
                                                    className="size-4 shrink-0"
                                                    aria-hidden="true"
                                                />
                                            }
                                            onSelect={() =>
                                                onSelect({
                                                    kind: 'lesson',
                                                    sectionId: section.id,
                                                    lessonId: lesson.id,
                                                })
                                            }
                                        >
                                            {lesson.contents.length === 0 ? (
                                                <>
                                                    {onCreateContent && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mb-3"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                onCreateContent(
                                                                    section.id,
                                                                    lesson.id,
                                                                )
                                                            }
                                                        >
                                                            <Plus /> افزودن
                                                            محتوا
                                                        </Button>
                                                    )}
                                                    <EmptyBranch>
                                                        این لسن هنوز محتوا
                                                        ندارد.
                                                    </EmptyBranch>
                                                </>
                                            ) : (
                                                <>
                                                    {onCreateContent && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mb-3"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                onCreateContent(
                                                                    section.id,
                                                                    lesson.id,
                                                                )
                                                            }
                                                        >
                                                            <Plus /> افزودن
                                                            محتوا
                                                        </Button>
                                                    )}
                                                    <ul className="space-y-2 border-s ps-4">
                                                        {lesson.contents.map(
                                                            (content) => (
                                                                <li
                                                                    key={
                                                                        content.id
                                                                    }
                                                                >
                                                                    <SelectionButton
                                                                        selected={
                                                                            selection?.kind ===
                                                                                'content' &&
                                                                            selection.sectionId ===
                                                                                section.id &&
                                                                            selection.lessonId ===
                                                                                lesson.id &&
                                                                            selection.contentId ===
                                                                                content.id
                                                                        }
                                                                        onSelect={() =>
                                                                            onSelect(
                                                                                {
                                                                                    kind: 'content',
                                                                                    sectionId:
                                                                                        section.id,
                                                                                    lessonId:
                                                                                        lesson.id,
                                                                                    contentId:
                                                                                        content.id,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText
                                                                            className="size-4 shrink-0"
                                                                            aria-hidden="true"
                                                                        />
                                                                        <span
                                                                            className="min-w-0 flex-1 truncate"
                                                                            dir="auto"
                                                                        >
                                                                            {content.description?.trim() ||
                                                                                `محتوای ${contentTypeLabels[content.type]}`}
                                                                        </span>
                                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                                            {
                                                                                contentTypeLabels[
                                                                                    content
                                                                                        .type
                                                                                ]
                                                                            }
                                                                        </span>
                                                                    </SelectionButton>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </>
                                            )}
                                        </StructureGroup>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </StructureGroup>
                </li>
            ))}
        </ul>
    );
}

function StructureGroup({
    label,
    count,
    selected,
    icon,
    onSelect,
    children,
    reveal,
}: {
    label: string;
    count: string;
    selected: boolean;
    icon: ReactNode;
    onSelect: () => void;
    children: ReactNode;
    reveal?: string;
}) {
    const [disclosure, setDisclosure] = useState({ open: true, reveal });
    const open = disclosure.reveal === reveal ? disclosure.open : true;
    return (
        <Collapsible
            open={open}
            onOpenChange={(nextOpen) =>
                setDisclosure({ open: nextOpen, reveal })
            }
            className="rounded-xl border bg-card"
        >
            <div className="flex items-center gap-1 p-2">
                <CollapsibleTrigger
                    className="group rounded-lg p-2 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={`باز و بسته کردن ${label}`}
                >
                    <ChevronDown
                        className="size-4 transition-transform group-data-[state=closed]:rotate-90"
                        aria-hidden="true"
                    />
                </CollapsibleTrigger>
                <SelectionButton selected={selected} onSelect={onSelect}>
                    {icon}
                    <span className="min-w-0 flex-1 break-words" dir="auto">
                        {label}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                        {count}
                    </span>
                </SelectionButton>
            </div>
            <CollapsibleContent className="px-4 pb-4">
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}

function SelectionButton({
    selected,
    onSelect,
    children,
}: {
    selected: boolean;
    onSelect: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={cn(
                'flex w-full min-w-0 items-center gap-3 rounded-lg border px-3 py-3 text-start text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                selected
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent hover:bg-muted',
            )}
        >
            {children}
        </button>
    );
}

function EmptyBranch({ children }: { children: ReactNode }) {
    return (
        <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            {children}
        </p>
    );
}

export function CourseEditorItemPanel({
    sections,
    selection,
}: {
    sections: CourseEditorSection[];
    selection: CourseEditorSelection | null;
}) {
    const section = sections.find((item) => item.id === selection?.sectionId);
    const lesson =
        selection && selection.kind !== 'section'
            ? section?.lessons.find((item) => item.id === selection.lessonId)
            : undefined;
    const content =
        selection?.kind === 'content'
            ? lesson?.contents.find((item) => item.id === selection.contentId)
            : undefined;
    const item =
        selection?.kind === 'section'
            ? section
            : selection?.kind === 'lesson'
              ? lesson
              : content;

    if (!selection || !section || !item) {
        return (
            <div className="space-y-4">
                <h2 className="font-semibold">تنظیمات محتوا</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                    برای نمایش مشخصات، یک سکشن، لسن یا محتوا را از ساختار دوره
                    انتخاب کنید.
                </p>
            </div>
        );
    }

    const kindLabel =
        selection.kind === 'section'
            ? 'سکشن'
            : selection.kind === 'lesson'
              ? 'لسن'
              : 'محتوا';
    return (
        <div
            key={`${selection.kind}-${item.id}`}
            className="space-y-5"
            aria-live="polite"
        >
            <h2 className="font-semibold">تنظیمات {kindLabel}</h2>
            <p
                className="text-sm leading-7 break-words text-muted-foreground"
                dir="auto"
            >
                {section.name}
                {lesson && ` ← ${lesson.name}`}
                {content && ` ← ${contentTypeLabels[content.type]}`}
            </p>
            <dl className="space-y-4 text-sm">
                <Detail label="شناسه">{item.id}</Detail>
                <Detail label="ترتیب">{item.order}</Detail>
                {selection.kind === 'section' && (
                    <>
                        <Detail label="نام سکشن">{section.name}</Detail>
                        <Detail label="تعداد لسن‌ها">
                            {section.lessons.length}
                        </Detail>
                    </>
                )}
                {selection.kind === 'lesson' && lesson && (
                    <>
                        <Detail label="نام لسن">{lesson.name}</Detail>
                        <Detail label="تعداد محتواها">
                            {lesson.contents.length}
                        </Detail>
                    </>
                )}
                {content && (
                    <>
                        <Detail label="نوع محتوا">
                            {contentTypeLabels[content.type]}
                        </Detail>
                        <Detail label="توضیحات">
                            {content.description || 'توضیحی ثبت نشده است.'}
                        </Detail>
                    </>
                )}
            </dl>
            <p className="border-t pt-4 text-xs leading-6 text-muted-foreground">
                {selection.kind === 'content'
                    ? 'ویرایش محتوا برای مالک، مدرس و ادیتور دوره فعال است.'
                    : 'ویرایش مشخصات برای مالک، مدرس و ادیتور دوره فعال است.'}
            </p>
        </div>
    );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-muted-foreground">{label}</dt>
            <dd
                dir="auto"
                className="mt-1 leading-7 break-words whitespace-pre-wrap"
            >
                {children}
            </dd>
        </div>
    );
}
