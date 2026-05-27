import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Plan, Wallet } from "@/types";
import { OrderForm } from "@/components/forms";
import { create, index } from "@/routes/admin/order";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";


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
        title: 'Create',
        href: create().url
    }
];

export default function Create({ wallets, plans }: { wallets: Wallet[], plans: Plan[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Order" />
                <CreateOrderForm wallets={wallets} plans={plans} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateOrderForm({ wallets, plans }: { wallets: Wallet[], plans: Plan[] }) {
    return <OrderForm type="create" wallets={wallets} plans={plans} />
}
