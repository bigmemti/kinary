import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { ContentForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/content';
import { BreadcrumbItem, Lesson } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Content',
        href: index().url,
    },
    {
        title: 'Create',
        href: create().url,
    },
];

export default function Create({ lessons }: { lessons: Lesson[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Content" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Content" />
                <CreateContentForm lessons={lessons} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateContentForm({ lessons }: { lessons: Lesson[] }) {
    return <ContentForm type="create" lessons={lessons} />;
}
