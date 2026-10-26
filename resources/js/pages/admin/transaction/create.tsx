import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { TransactionForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/transaction';
import { BreadcrumbItem, Wallet } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Transaction',
        href: index().url,
    },
    {
        title: 'Create',
        href: create().url,
    },
];

export default function Create({ wallets }: { wallets: Wallet[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Transaction" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Transaction" />
                <CreateTransactionForm wallets={wallets} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateTransactionForm({ wallets }: { wallets: Wallet[] }) {
    return <TransactionForm type="create" wallets={wallets} />;
}
