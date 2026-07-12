import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import AppLayout from '../app-layout';

export default function EditLayout({
    children,
    breadcrumbs,
    title,
    header,
}: PropsWithChildren<{
    breadcrumbs: BreadcrumbItem[];
    title: string;
    header: string;
}>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <DashboardContainer>
                <DashboardHeader header={header} />
                {children}
            </DashboardContainer>
        </AppLayout>
    );
}
