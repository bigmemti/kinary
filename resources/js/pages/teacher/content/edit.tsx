import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { ContentForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, show } from '@/routes/teacher/content';
import { index } from '@/routes/teacher/lesson/content';
import { BreadcrumbItem, Content, Lesson } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    content,
    lessons,
}: {
    content: Content;
    lessons: Lesson[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Content',
            href: index(content.lesson_id).url,
        },
        {
            title: content.id.toString(),
            href: show(content).url,
        },
        {
            title: 'Edit',
            href: edit(content).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Content" />
            <DashboardContainer>
                <DashboardHeader header={`Edit ${content.id} info`} />
                <EditContentForm content={content} lessons={lessons} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditContentForm({
    content,
    lessons,
}: {
    content: Content;
    lessons: Lesson[];
}) {
    return <ContentForm type="edit" content={content} lessons={lessons} />;
}
