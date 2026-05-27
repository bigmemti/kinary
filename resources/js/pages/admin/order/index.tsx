import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Order } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, File, Pen, TableRowsSplit, Trash } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as plans } from "@/routes/admin/order/plan";
import { index as transactions } from "@/routes/admin/order/transaction";
import { create, destroy, edit, index, show } from "@/routes/admin/order";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Order',
        href: index().url
    }
];

export default function Index({ orders }: { orders: Order[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Order List"/>
            <DashboardContainer>
                <DashboardHeader header="Order List">
                    <CreateHeaderButton href={create().url} model="order" />
                </DashboardHeader>
                <ResponsiveOrderList orders={orders} />
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
                { header: "Wallet Name", cell: (order) => order.wallet?.user?.name, },
                { header: "Plan Count", cell: (order) => order.plans_count, },
                { header: "Transaction Count", cell: (order) => order.transactions_count, },
                { header: "Status", cell: (order) => order.status, },
                { header: "Amount", cell: (order) => order.amount, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (order) => <OrderActions order={order} /> },
            ]}
        />
    );
}

function OrderActions({ order }: { order: Order}) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            {!(order.transactions_count) && (
                    <FormButton className="inline" form={destroy.form(order)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={transactions(order).url}>
                <TableRowsSplit />
            </ButtonLink>
            <ButtonLink href={plans(order).url}>
                <File />
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