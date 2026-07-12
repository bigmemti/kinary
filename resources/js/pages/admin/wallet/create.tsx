import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { WalletForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/wallet';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Wallet',
        href: index().url,
    },
    {
        title: 'Create',
        href: create().url,
    },
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
    return <WalletForm type="create" users={users} />;
}
