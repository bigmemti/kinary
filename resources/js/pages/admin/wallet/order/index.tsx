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
import { destroy, edit, show } from '@/routes/admin/order';
import { index as plans } from '@/routes/admin/order/plan';
import { index, show as wallet_show } from '@/routes/admin/wallet';
import { create, index as orders } from '@/routes/admin/wallet/order';
import { BreadcrumbItem, Order, Wallet } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, Layers, Pen, Trash } from 'lucide-react';

export default function Index({ wallet }: { wallet: Wallet }) {
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
            title: wallet.user?.name || wallet.id.toString(),
            href: wallet_show(wallet).url,
        },
        {
            title: 'Orders',
            href: orders(wallet).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet List" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Wallet ${wallet.user?.name} Orders List`}
                >
                    <CreateHeaderButton
                        href={create(wallet).url}
                        model="order"
                    />
                </DashboardHeader>
                {!!wallet.orders && wallet.orders?.length > 0 && (
                    <ResponsiveOrderList orders={wallet.orders} />
                )}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveOrderList({ orders }: { orders: Order[] }) {
    return (
        <ResponsiveDataList
            data={orders}
            columns={[
                { header: 'ID', cell: (order) => order.id },
                { header: 'Amount', cell: (order) => order.amount },
                { header: 'Plan Count', cell: (order) => order.plans_count },
                {
                    header: 'Transaction Count',
                    cell: (order) => order.transactions_count,
                },
                { header: 'Status', cell: (order) => order.status },
                { header: 'Created At', cell: (order) => order.created_at },
                { header: 'Updated At', cell: (order) => order.updated_at },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (order) => <OrderActions order={order} />,
                },
            ]}
        />
    );
}

function OrderActions({ order }: { order: Order }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            <FormButton
                className="inline"
                form={destroy.form(order)}
                options={{ preserveScroll: true }}
            >
                <Trash />
            </FormButton>
            <ButtonLink href={plans(order).url}>
                <Layers />
            </ButtonLink>
            <ButtonLink href={edit(order).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(order).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
