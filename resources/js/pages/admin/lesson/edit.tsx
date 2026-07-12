import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { LessonForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, index, show } from '@/routes/admin/lesson';
import { BreadcrumbItem, Lesson, Section } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    lesson,
    sections,
}: {
    lesson: Lesson;
    sections: Section[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Lesson',
            href: index().url,
        },
        {
            title: lesson.name,
            href: show(lesson).url,
        },
        {
            title: 'Edit',
            href: edit(lesson).url,
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

function EditLessonForm({
    lesson,
    sections,
}: {
    lesson: Lesson;
    sections: Section[];
}) {
    return <LessonForm type="edit" sections={sections} lesson={lesson} />;
}
