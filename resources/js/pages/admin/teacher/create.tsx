import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { TeacherForm } from "@/components/forms";
import { create, index } from "@/routes/admin/teacher";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Teacher',
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
            <Head title="Teacher User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Teacher" />
                <CreateTeacherForm users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateTeacherForm({ users }: { users: User[] }) {
    return <TeacherForm type="create" users={users} />
}
