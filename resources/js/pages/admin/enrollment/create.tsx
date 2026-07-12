import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { EnrollmentForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/enrollment';
import { BreadcrumbItem, Plan, Student } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Enrollment',
        href: index().url,
    },
    {
        title: 'Create',
        href: create().url,
    },
];

export default function Create({
    students,
    plans,
}: {
    students: Student[];
    plans: Plan[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Enrollment" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Enrollment" />
                <CreateEnrollmentForm plans={plans} students={students} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateEnrollmentForm({
    students,
    plans,
}: {
    students: Student[];
    plans: Plan[];
}) {
    return <EnrollmentForm type="create" plans={plans} students={students} />;
}
