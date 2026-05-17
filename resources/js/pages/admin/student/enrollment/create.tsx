import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Plan, Student, User } from "@/types";
import { create, index as enrollments } from "@/routes/admin/student/enrollment";
import { index, show as student_show } from "@/routes/admin/student";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { StudentEnrollmentForm } from "@/components/forms";

export default function Create({ student, plans }: { student: Student, plans: Plan[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Student',
            href: index().url
        },
        {
            title: student.user?.name ||  student.id.toString(),
            href: student_show(student).url
        },
        {
            title: 'Enrollments',
            href: enrollments(student).url
        },
        {
            title: 'Create',
            href: create(student).url
        }
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
