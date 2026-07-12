import ButtonLink from '@/components/button-link';
import {
    CreateHeaderButton,
    DashboardContainer,
    DashboardHeader,
} from '@/components/dashboard';
import FormButton from '@/components/form-button';
import Pagination from '@/components/pagination';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, destroy, edit, index, show } from '@/routes/admin/wallet';
import { index as orders } from '@/routes/admin/wallet/order';
import { BreadcrumbItem, Wallet } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, File, Pen, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Wallet',
        href: index().url,
    },
];
export default function Index({
    wallets,
    meta,
}: {
    wallets: Wallet[];
    meta: unknown;
}) {
    // console.log(wallets);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet List" />
            <DashboardContainer>
                <DashboardHeader header="Wallet List">
                    <CreateHeaderButton href={create().url} model="wallet" />
                </DashboardHeader>
                <ResponsiveWalletList wallets={wallets} />
                <Pagination meta={meta} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveWalletList({ wallets }: { wallets: Wallet[] }) {
    return (
        <ResponsiveDataList
            data={wallets}
            columns={[
                { header: 'ID', cell: (wallet) => wallet.id },
                { header: 'User ID', cell: (wallet) => wallet.user?.id },
                { header: 'User Name', cell: (wallet) => wallet.user?.name },
                { header: 'Balance', cell: (wallet) => wallet.balance },
                {
                    header: 'Order Count',
                    cell: (wallet) => wallet.orders_count,
                },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (wallet) => <WalletActions wallet={wallet} />,
                },
            ]}
        />
    );
}

function WalletActions({ wallet }: { wallet: Wallet }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            {wallet.orders_count ? (
                <ButtonLink href={orders(wallet).url}>
                    <File />
                </ButtonLink>
            ) : (
                <FormButton
                    className="inline"
                    form={destroy.form(wallet)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={edit(wallet).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(wallet).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
