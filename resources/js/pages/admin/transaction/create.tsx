import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { TransactionForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/transaction';
import { BreadcrumbItem, Order } from '@/types';
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

export default function Create({ orders }: { orders: Order[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Transaction" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Transaction" />
                <CreateTransactionForm orders={orders} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateTransactionForm({ orders }: { orders: Order[] }) {
    return <TransactionForm type="create" orders={orders} />;
}
