import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { UserForm } from "@/components/forms";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { edit, index, show } from "@/routes/admin/user";
import { BreadcrumbItem, User } from "@/types";
import { Head } from "@inertiajs/react";

export default function Edit({ user }: { user: User}) {
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
            title: user.name,
            href: show(user).url
        },
        {
            title: 'Edit',
            href: edit(user).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <DashboardContainer>
                <DashboardHeader header={`Edit ${user.name} info`} />
                <EditUserForm user={user} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditUserForm({ user }: { user: User}) {
    return <UserForm type="edit" user={user} />
}

