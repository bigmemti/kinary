import ButtonLink from '@/components/button-link';
import {
    ActionButtonContainer,
    DashboardContainer,
    DashboardHeader,
    DataContainer,
    InfoBlock,
} from '@/components/dashboard';
import FormButton from '@/components/form-button';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { destroy, edit, index, show } from '@/routes/admin/order';
import { index as plans } from '@/routes/admin/order/plan';
import { index as transactions } from '@/routes/admin/order/transaction';
import { BreadcrumbItem, Order, Plan, Transaction } from '@/types';
import { Head } from '@inertiajs/react';
import { Pen, Trash } from 'lucide-react';

export default function Show({ order }: { order: Order }) {
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
            href: show(order).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Order" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Show Order ${order.id.toString()} info`}
                >
                    <OrderActions order={order} />
                </DashboardHeader>
                <DataContainer>
                    <OrderMeta order={order} />
                    <TransactionsInfo order={order} />
                    <PlansInfo order={order} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function PlansInfo({ order }: { order: Order }) {
    return (
        <>
            <DashboardHeader header={`Plan info`} containerClassName="my-4">
                <PlanActions order={order} />
            </DashboardHeader>
            <PlansMeta order={order} />
            {!!order.plans && order.plans?.length > 0 && (
                <ResponsivePlanList plans={order.plans} />
            )}
        </>
    );
}

function ResponsivePlanList({ plans }: { plans: Plan[] }) {
    return (
        <ResponsiveDataList
            data={plans}
            columns={[
                { header: 'ID', cell: (plan) => plan.id },
                { header: 'Course', cell: (plan) => plan.course?.title },
                { header: 'Plan', cell: (plan) => plan.name },
                {
                    header: 'Teacher',
                    cell: (plan) => plan.course?.teacher?.user?.name,
                },
                { header: 'Price', cell: (plan) => plan.price },
                { header: 'Created At', cell: (plan) => plan.created_at },
                { header: 'Updated At', cell: (plan) => plan.updated_at },
            ]}
        />
    );
}

function PlansMeta({ order }: { order: Order }) {
    return (
        <>
            <InfoBlock label="Plans Count" value={order.plans_count} />
        </>
    );
}

function PlanActions({ order }: { order: Order }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={plans(order).url}>Plans</ButtonLink>
        </ActionButtonContainer>
    );
}

function TransactionsInfo({ order }: { order: Order }) {
    return (
        <>
            <DashboardHeader
                header={`Transaction info`}
                containerClassName="my-4"
            >
                <TransactionActions order={order} />
            </DashboardHeader>
            <TransactionsMeta order={order} />
            {!!order.transactions && order.transactions?.length > 0 && (
                <ResponsiveTransactionList transactions={order.transactions} />
            )}
        </>
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
            ]}
        />
    );
}

function TransactionsMeta({ order }: { order: Order }) {
    return (
        <>
            <InfoBlock
                label="Transactions Count"
                value={order.transactions_count}
            />
        </>
    );
}

function TransactionActions({ order }: { order: Order }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={transactions(order).url}>Transactions</ButtonLink>
        </ActionButtonContainer>
    );
}

function OrderMeta({ order }: { order: Order }) {
    return (
        <>
            <InfoBlock label="ID" value={order.id} />
            <InfoBlock label="Wallet ID" value={order.wallet?.id} />
            <InfoBlock label="User ID" value={order.wallet?.user?.id} />
            <InfoBlock label="User Name" value={order.wallet?.user?.name} />
            <InfoBlock label="Amount" value={order.amount} />
            <InfoBlock label="Status" value={order.status} />
            <InfoBlock label="Created At" value={order.created_at} />
            <InfoBlock label="Updated At" value={order.updated_at} />
        </>
    );
}

function OrderActions({ order }: { order: Order }) {
    return (
        <ActionButtonContainer>
            {!!order.transactions_count && (
                <FormButton
                    className="inline"
                    form={destroy.form(order)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={edit(order).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}
