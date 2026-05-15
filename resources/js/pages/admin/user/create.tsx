import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { UserForm } from "@/components/forms";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { create, index } from "@/routes/admin/user";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'User',
        href: index().url
    },
    {
        title: 'Create',
        href: create().url
    }
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new User" />
                <CreateUserForm />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateUserForm() {
    return <UserForm type="create" />
}
