import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { StudentEnrollmentForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index, show as student_show } from '@/routes/admin/student';
import {
    create,
    index as enrollments,
} from '@/routes/admin/student/enrollment';
import { BreadcrumbItem, Plan, Student } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({
    student,
    plans,
}: {
    student: Student;
    plans: Plan[];
}) {
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
            title: student.user?.name || student.id.toString(),
            href: student_show(student).url,
        },
        {
            title: 'Enrollments',
            href: enrollments(student).url,
        },
        {
            title: 'Create',
            href: create(student).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Enrollment" />
                <StudentEnrollmentForm student={student} plans={plans} />
            </DashboardContainer>
        </AppLayout>
    );
}
