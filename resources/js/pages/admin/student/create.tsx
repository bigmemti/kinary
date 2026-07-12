import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { StudentForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/student';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Student',
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
            <Head title="Student User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Student" />
                <CreateStudentForm users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateStudentForm({ users }: { users: User[] }) {
    return <StudentForm type="create" users={users} />;
}
