import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { PlanForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/plan';
import { BreadcrumbItem, Course } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Plan',
        href: index().url,
    },
    {
        title: 'Create',
        href: create().url,
    },
];

export default function Create({ courses }: { courses: Course[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Plan" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Plan" />
                <CreatePlanForm courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreatePlanForm({ courses }: { courses: Course[] }) {
    return <PlanForm type="create" courses={courses} />;
}
