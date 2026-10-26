import { persianNumber } from '@/components/storefront';
import { lesson as lessonRoute } from '@/routes/student/study';
import type { StudyProgress, StudySection } from '@/types/study';
import { Link } from '@inertiajs/react';
import { CheckCircle2, ChevronDown } from 'lucide-react';

export function StudyProgressBar({
    readCount,
    totalCount,
    percentage,
}: StudyProgress) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap justify-between gap-2 text-sm leading-7">
                <span>
                    {persianNumber(readCount)} محتوای خوانده‌شده ·{' '}
                    {persianNumber(totalCount - readCount)} محتوای باقی‌مانده
                </span>
                <span>{persianNumber(percentage)}٪</span>
            </div>
            <div
                role="progressbar"
                aria-label="پیشرفت مطالعه"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2.5 overflow-hidden rounded-full bg-[#243b37]/10 dark:bg-white/10"
            >
                <div
                    className="h-full rounded-full bg-[#687943] transition-[width] dark:bg-[#d9e3ad]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export function StudyOutline({
    spaceId,
    sections,
    currentLessonId,
}: {
    spaceId: number;
    sections: StudySection[];
    currentLessonId?: number;
}) {
    return (
        <div className="space-y-3 text-right" lang="fa">
            {sections.length === 0 && (
                <p className="leading-8 opacity-70">
                    هنوز محتوای قابل‌مطالعه‌ای برای این فضا قرار نگرفته است.
                </p>
            )}
            {sections.map((section) => (
                <details
                    key={section.id}
                    open={
                        currentLessonId !== undefined &&
                        section.lessons.some(
                            (lesson) => lesson.id === currentLessonId,
                        )
                    }
                    className="rounded-2xl border border-current/10"
                >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 text-right font-semibold focus-visible:outline-2 focus-visible:outline-[#8b9b5a]">
                        <span>بخش: {section.name}</span>
                        <ChevronDown className="size-4 shrink-0" />
                    </summary>
                    <ul className="space-y-2 px-4 pb-4">
                        {section.lessons.map((lesson) => (
                            <li
                                key={lesson.id}
                                className="border-r border-current/15 pr-3"
                            >
                                <Link
                                    href={lessonRoute({
                                        space: spaceId,
                                        lesson: lesson.id,
                                    })}
                                    aria-current={
                                        lesson.id === currentLessonId
                                            ? 'page'
                                            : undefined
                                    }
                                    className="flex items-center justify-between gap-3 rounded-xl p-3 text-right leading-7 hover:bg-[#e7ebdf] focus-visible:outline-2 focus-visible:outline-[#8b9b5a] aria-[current=page]:bg-[#e7ebdf] dark:hover:bg-white/10 dark:aria-[current=page]:bg-white/10"
                                >
                                    <span>درس: {lesson.name}</span>
                                    {lesson.readCount === lesson.totalCount && (
                                        <CheckCircle2
                                            aria-label="خوانده‌شده"
                                            className="size-4 shrink-0 text-[#687943] dark:text-[#d9e3ad]"
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </div>
    );
}
