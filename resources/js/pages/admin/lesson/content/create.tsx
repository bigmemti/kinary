import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Lesson } from "@/types";
import { create, index as contents } from "@/routes/admin/lesson/content";
import { index, show as lesson_show } from "@/routes/admin/lesson";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { LessonContentForm } from "@/components/forms";

export default function Create({ lesson }: { lesson: Lesson }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Lesson',
            href: index().url
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
