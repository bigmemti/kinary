import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ButtonLink from "@/components/button-link";
import { destroy, edit, index, show } from "@/routes/admin/wallet";
import { BreadcrumbItem, Order, Wallet } from "@/types";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as orders } from "@/routes/admin/wallet/order";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ wallet }: { wallet: Wallet}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Wallet',
            href: index().url
        },
        {
            title: wallet.user?.name ?? wallet.id.toString(),
            href: show(wallet).url
        },
    ];
console.log(wallet)
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Wallet" />
            <DashboardContainer>
                <DashboardHeader header={`Show Wallet ${wallet.user?.name?? wallet.id} info`} >
                    <WalletActions wallet={wallet} />
                </DashboardHeader>
                <DataContainer>
                    <WalletMeta wallet={wallet} />
                    <OrdersInfo wallet={wallet} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function OrdersInfo({ wallet }: { wallet: Wallet }) {
    return (
        <>
            <DashboardHeader header={`Order info`} containerClassName="my-4">
                <OrderActions wallet={wallet} />
            </DashboardHeader>
            <OrdersMeta wallet={wallet} />
            {(!!wallet.orders && wallet.orders?.length > 0) && <ResponsiveOrderList orders={wallet.orders} />}
        </>
    );
}

function ResponsiveOrderList({ orders }: { orders: Order[]}) {
    return (
        <ResponsiveDataList
            data={orders}
            columns={[
                { header: "ID", cell: (order) => order.id, },
                { header: "Amount", cell: (order) => order.amount, },
                { header: "Plans Count", cell: (order) => order.plans_count, },
                { header: "Transaction Count", cell: (order) => order.transactions_count, },
                { header: "Status", cell: (order) => order.status, },
                { header: "Created At", cell: (order) => order.created_at, },
                { header: "Updated At", cell: (order) => order.updated_at, },
            ]}
        />
    );
}

function OrdersMeta({ wallet }: { wallet: Wallet }) {
    return(
        <>
            <InfoBlock label="Orders Count" value={wallet.orders_count} />
        </>
    );
}

function OrderActions({ wallet }: { wallet: Wallet }) { 
    return (
        <ActionButtonContainer>
            <ButtonLink href={orders(wallet).url}>
                Orders
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function WalletMeta({ wallet }: { wallet: Wallet }) {
    return(
        <>
            <InfoBlock label="ID" value={wallet.id} />
            <InfoBlock label="User ID" value={wallet.user?.id} />
            <InfoBlock label="User Name" value={wallet.user?.name} />
            <InfoBlock label="Created At" value={wallet.created_at} />
            <InfoBlock label="Updated At" value={wallet.updated_at} />
        </>
    );
}

function WalletActions({ wallet }: { wallet: Wallet}) {
    return (
        <ActionButtonContainer>
            {!!wallet.orders_count && (
                    <FormButton className="inline" form={destroy.form(wallet)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(wallet).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}