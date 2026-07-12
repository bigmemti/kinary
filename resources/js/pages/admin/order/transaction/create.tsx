import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { OrderTransactionForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index, show as order_show } from '@/routes/admin/order';
import {
    create,
    index as transactions,
} from '@/routes/admin/order/transaction';
import { BreadcrumbItem, Order } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({ order }: { order: Order }) {
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
        {
            title: 'Create',
            href: create(order).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Transaction" />
                <OrderTransactionForm order={order} />
            </DashboardContainer>
        </AppLayout>
    );
}
