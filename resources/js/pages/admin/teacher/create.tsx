import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { TeacherForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/teacher';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Teacher',
        href: index().url,
    },
    {
        title: 'Create',
        href: create().url,
    },
];

export default function Create({ users }: { users: User[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Teacher" />
                <CreateTeacherForm users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateTeacherForm({ users }: { users: User[] }) {
    return <TeacherForm type="create" users={users} />;
}
