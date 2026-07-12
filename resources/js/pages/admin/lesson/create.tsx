import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { LessonForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/lesson';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';

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
        title: 'Create',
        href: create().url,
    },
];

export default function Create({ sections }: { sections: User[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lesson User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Lesson" />
                <CreateLessonForm sections={sections} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateLessonForm({ sections }: { sections: User[] }) {
    return <LessonForm type="create" sections={sections} />;
}
