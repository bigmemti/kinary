import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { WalletForm } from "@/components/forms";
import { BreadcrumbItem, Wallet, User } from "@/types";
import { edit, index, show } from "@/routes/admin/wallet";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";

export default function Edit({ wallet, users }: { wallet: Wallet, users: User[] }) {
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
            title: wallet.user?.name?? wallet.id.toString(),
            href: show(wallet).url
        },
        {
            title: 'Edit',
            href: edit(wallet).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Wallet" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Wallet ${wallet.user?.name?? wallet.id} info`} />
                <EditWalletForm wallet={wallet} users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditWalletForm({ wallet, users }: { wallet: Wallet, users: User[] }) {
    return <WalletForm type="edit" users={users} wallet={wallet} />
}

