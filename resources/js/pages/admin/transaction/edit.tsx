import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { TransactionForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, index, show } from '@/routes/admin/transaction';
import { BreadcrumbItem, Transaction, Wallet } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    transaction,
    wallets,
}: {
    transaction: Transaction;
    wallets: Wallet[];
}) {
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
            title: transaction.id.toString(),
            href: show(transaction).url,
        },
        {
            title: 'Edit',
            href: edit(transaction).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Transaction" />
            <DashboardContainer>
                <DashboardHeader header={`Edit ${transaction.id} info`} />
                <EditTransactionForm
                    transaction={transaction}
                    wallets={wallets}
                />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditTransactionForm({
    transaction,
    wallets,
}: {
    transaction: Transaction;
    wallets: Wallet[];
}) {
    return (
        <TransactionForm
            type="edit"
            transaction={transaction}
            wallets={wallets}
        />
    );
}
