import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { OrderForm } from "@/components/forms";
import { BreadcrumbItem, Order, Plan, Wallet } from "@/types";
import { edit, index, show } from "@/routes/admin/order";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";

export default function Edit({ order, wallets, plans }: { order: Order, wallets: Wallet[], plans: Plan[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Order',
            href: index().url
        },
        {
            title: order.id.toString(),
            href: show(order).url
        },
        {
            title: 'Edit',
            href: edit(order).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Order" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Order ${order.id.toString()} info`} />
                <EditOrderForm order={order} wallets={wallets} plans={plans} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditOrderForm({ order, wallets, plans }: { order: Order, wallets: Wallet[], plans: Plan[] }) {
    return <OrderForm type="edit" wallets={wallets} plans={plans} order={order} />
}

