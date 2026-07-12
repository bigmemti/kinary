import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { SectionForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/section';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Section',
        href: index().url,
    },
    {
        title: 'Create',
        href: create().url,
    },
];

export default function Create({ courses }: { courses: User[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Section User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Section" />
                <CreateSectionForm courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateSectionForm({ courses }: { courses: User[] }) {
    return <SectionForm type="create" courses={courses} />;
}
