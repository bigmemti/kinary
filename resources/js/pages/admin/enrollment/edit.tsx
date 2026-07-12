import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { EnrollmentForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, index, show } from '@/routes/admin/enrollment';
import { BreadcrumbItem, Enrollment, Plan, Student } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    enrollment,
    students,
    plans,
}: {
    enrollment: Enrollment;
    students: Student[];
    plans: Plan[];
}) {
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
            title: enrollment.id.toString(),
            href: show(enrollment).url,
        },
        {
            title: 'Edit',
            href: edit(enrollment).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Enrollment" />
            <DashboardContainer>
                <DashboardHeader header={`Edit ${enrollment.id} info`} />
                <EditEnrollmentForm
                    enrollment={enrollment}
                    students={students}
                    plans={plans}
                />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditEnrollmentForm({
    enrollment,
    students,
    plans,
}: {
    enrollment: Enrollment;
    students: Student[];
    plans: Plan[];
}) {
    return (
        <EnrollmentForm
            type="edit"
            enrollment={enrollment}
            students={students}
            plans={plans}
        />
    );
}
