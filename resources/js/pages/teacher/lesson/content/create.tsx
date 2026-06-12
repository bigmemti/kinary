import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Lesson } from "@/types";
import { create, index as contents } from "@/routes/teacher/lesson/content";
import { show as lesson_show } from "@/routes/teacher/lesson";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { LessonContentForm } from "@/components/forms";
import { index } from "@/routes/teacher/section/lesson";

export default function Create({ lesson }: { lesson: Lesson }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Lesson',
            href: index(lesson).url
        },
        {
            title: lesson.name,
            href: lesson_show(lesson).url
        },
        {
            title: 'Contents',
            href: contents(lesson).url
        },
        {
            title: 'Create',
            href: create(lesson).url
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lesson User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Content" />
                <LessonContentForm lesson={lesson} />
            </DashboardContainer>
        </AppLayout>
    );
}
