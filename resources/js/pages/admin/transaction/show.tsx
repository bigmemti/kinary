import ButtonLink from "@/components/button-link";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { destroy, edit, index, show } from "@/routes/admin/transaction";
import { BreadcrumbItem, Transaction } from "@/types";
import { Head } from "@inertiajs/react";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ transaction }: { transaction: Transaction }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Transaction',
            href: index().url
        },
        {
            title: transaction.id.toString(),
            href: show(transaction).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Transaction" />
            <DashboardContainer>
                <DashboardHeader header={`Show ${transaction.id} info`}>
                    <TransactionActions transaction={transaction} />
                </DashboardHeader>
                <DataContainer>
                    <TransactionMeta transaction={transaction} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function TransactionMeta({ transaction }: { transaction: Transaction }) {
    return(
        <>
            <InfoBlock label="ID" value={transaction.id} />
            <InfoBlock label="Amount" value={transaction.amount} />
            <InfoBlock label="Gateway" value={transaction.gateway} />
            <InfoBlock label="Status" value={transaction.status} />
            <InfoBlock label="Paid At" value={transaction.paid_at} />
            <InfoBlock label="Order" value={transaction.order?.id} />
            <InfoBlock label="Order Amount" value={transaction.order?.amount} />
            <InfoBlock label="Wallet ID" value={transaction.order?.wallet?.id} />
            <InfoBlock label="User ID" value={transaction.order?.wallet?.user?.id} />
            <InfoBlock label="Wallet" value={transaction.order?.wallet?.user?.name} />
            <InfoBlock label="Created At" value={transaction.created_at} />
            <InfoBlock label="Updated At" value={transaction.updated_at} />
        </>
    );
}

function TransactionActions({ transaction }: { transaction: Transaction}) {
    return (
        <ActionButtonContainer>
            <FormButton className="inline" form={destroy.form(transaction)} options={{ preserveScroll: true }}>
                <Trash />
            </FormButton>
            <ButtonLink href={edit(transaction).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}