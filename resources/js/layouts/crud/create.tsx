import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import AppLayout from '../app-layout';

export default function CreateLayout({
    children,
    breadcrumbs,
    title,
}: PropsWithChildren<{ breadcrumbs: BreadcrumbItem[]; title: string }>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <DashboardContainer>
                <DashboardHeader header={title} />
                {children}
            </DashboardContainer>
        </AppLayout>
    );
}
