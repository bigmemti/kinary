import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { WalletForm } from "@/components/forms";
import { create, index } from "@/routes/admin/wallet";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Wallet',
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
            <Head title="Wallet User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Wallet" />
                <CreateWalletForm users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateWalletForm({ users }: { users: User[] }) {
    return <WalletForm type="create" users={users} />
}
