import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Order, Plan } from "@/types";
import ButtonLink from "@/components/button-link";
import { Eye, File, Pen, Wallet } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as orders } from "@/routes/admin/plan/order";
import { index, show as plan_show } from "@/routes/admin/plan";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { show as wallet } from '@/routes/admin/wallet';
import { index as transactions } from '@/routes/admin/order/transaction';
import { edit, show } from "@/routes/admin/order";

export default function Index({ plan }: { plan: Plan }){
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Plan',
            href: index().url
        },
        {
            title: plan.name,
            href: plan_show(plan).url
        },
        {
            title: 'Orders',
            href: orders(plan).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Plan List"/>
            <DashboardContainer>
                <DashboardHeader header={`Plan ${plan.name} Orders List`} />
                {(!!plan.orders && plan.orders?.length > 0) && <ResponsiveOrderList orders={plan.orders} />}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveOrderList({ orders }: { orders: Order[]}) {
    return (
        <ResponsiveDataList
            data={orders}
            columns={[
                { header: "ID", cell: (order) => order.id, },
                { header: "User ID", cell: (order) => order.wallet?.user?.id, },
                { header: "User", cell: (order) => order.wallet?.user?.name, },
                { header: "Amount", cell: (order) => order.amount, },
                { header: "Plan Count", cell: (order) => order.plans_count, },
                { header: "Transaction Count", cell: (order) => order.transactions_count, },
                { header: "Status", cell: (order) => order.status, },
                { header: "Created At", cell: (order) => order.created_at, },
                { header: "Updated At", cell: (order) => order.updated_at, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (order) => <OrderActions order={order} /> },
            ]}
        />
    );
}

function OrderActions({ order }: { order: Order }) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            <ButtonLink href={transactions(order).url}>
                <File />
            </ButtonLink>
            <ButtonLink href={wallet(order.wallet_id).url}>
                <Wallet />
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