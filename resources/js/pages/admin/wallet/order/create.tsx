import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { WalletOrderForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index, show as wallet_show } from '@/routes/admin/wallet';
import { create, index as orders } from '@/routes/admin/wallet/order';
import { BreadcrumbItem, Wallet } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({ wallet }: { wallet: Wallet }) {
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
        {
            title: 'Create',
            href: create(wallet).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Order" />
                <WalletOrderForm wallet={wallet} />
            </DashboardContainer>
        </AppLayout>
    );
}
