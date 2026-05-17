import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { StudentForm } from "@/components/forms";
import { BreadcrumbItem, Student, User } from "@/types";
import { edit, index, show } from "@/routes/admin/student";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";

export default function Edit({ student, users }: { student: Student, users: User[] }) {
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
            title: student.id.toString(),
            href: show(student).url
        },
        {
            title: 'Edit',
            href: edit(student).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Student" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Student ${student.id} info`} />
                <EditStudentForm student={student} users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditStudentForm({ student, users }: { student: Student, users: User[] }) {
    return <StudentForm type="edit" users={users} student={student} />
}

