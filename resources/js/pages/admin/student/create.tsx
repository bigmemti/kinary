import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { StudentForm } from "@/components/forms";
import { create, index } from "@/routes/admin/student";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";


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
        title: 'Create',
        href: create().url
    }
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
    return <StudentForm type="create" users={users} />
}
