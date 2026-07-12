import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { WalletForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, index, show } from '@/routes/admin/wallet';
import { BreadcrumbItem, User, Wallet } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    wallet,
    users,
}: {
    wallet: Wallet;
    users: User[];
}) {
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
            title: wallet.user?.name ?? wallet.id.toString(),
            href: show(wallet).url,
        },
        {
            title: 'Edit',
            href: edit(wallet).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Wallet" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Edit Wallet ${wallet.user?.name ?? wallet.id} info`}
                />
                <EditWalletForm wallet={wallet} users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditWalletForm({ wallet, users }: { wallet: Wallet; users: User[] }) {
    return <WalletForm type="edit" users={users} wallet={wallet} />;
}
