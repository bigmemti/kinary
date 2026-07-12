import ButtonLink from '@/components/button-link';
import {
    CreateHeaderButton,
    DashboardContainer,
    DashboardHeader,
} from '@/components/dashboard';
import FormButton from '@/components/form-button';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index, show as order_show } from '@/routes/admin/order';
import {
    create,
    index as transactions,
} from '@/routes/admin/order/transaction';
import { destroy, edit, show } from '@/routes/admin/transaction';
import { BreadcrumbItem, Order, Transaction } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, Pen, Trash } from 'lucide-react';

export default function Index({ order }: { order: Order }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Order',
            href: index().url,
        },
        {
            title: order.id.toString(),
            href: order_show(order).url,
        },
        {
            title: 'Transactions',
            href: transactions(order).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order List" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Order ${order.id.toString()} Transactions List`}
                >
                    <CreateHeaderButton
                        href={create(order).url}
                        model="transaction"
                    />
                </DashboardHeader>
                {!!order.transactions && order.transactions?.length > 0 && (
                    <ResponsiveTransactionList
                        transactions={order.transactions}
                    />
                )}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveTransactionList({
    transactions,
}: {
    transactions: Transaction[];
}) {
    return (
        <ResponsiveDataList
            data={transactions}
            columns={[
                { header: 'ID', cell: (transaction) => transaction.id },
                { header: 'Amount', cell: (transaction) => transaction.amount },
                {
                    header: 'Gateway',
                    cell: (transaction) => transaction.gateway,
                },
                { header: 'Status', cell: (transaction) => transaction.status },
                {
                    header: 'Paid At',
                    cell: (transaction) => transaction.paid_at,
                },
                {
                    header: 'Created At',
                    cell: (transaction) => transaction.created_at,
                },
                {
                    header: 'Updated At',
                    cell: (transaction) => transaction.updated_at,
                },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (transaction) => (
                        <TransactionActions transaction={transaction} />
                    ),
                },
            ]}
        />
    );
}

function TransactionActions({ transaction }: { transaction: Transaction }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            <FormButton
                className="inline"
                form={destroy.form(transaction)}
                options={{ preserveScroll: true }}
            >
                <Trash />
            </FormButton>
            <ButtonLink href={edit(transaction).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(transaction).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
