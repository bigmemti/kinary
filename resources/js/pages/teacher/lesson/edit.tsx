import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { LessonForm } from "@/components/forms";
import { BreadcrumbItem, Lesson, Section } from "@/types";
import { edit, show } from "@/routes/teacher/lesson";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { index } from "@/routes/teacher/section/lesson";

export default function Edit({ lesson, sections }: { lesson: Lesson, sections: Section[] }) {
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
            href: show(lesson).url
        },
        {
            title: 'Edit',
            href: edit(lesson).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Lesson" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Lesson ${lesson.name} info`} />
                <EditLessonForm lesson={lesson} sections={sections} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditLessonForm({ lesson, sections }: { lesson: Lesson, sections: Section[] }) {
    return <LessonForm type="edit" sections={sections} lesson={lesson} />
}

