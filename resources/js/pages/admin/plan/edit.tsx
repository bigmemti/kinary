import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { PlanForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, index, show } from '@/routes/admin/plan';
import { BreadcrumbItem, Course, Plan } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    plan,
    courses,
}: {
    plan: Plan;
    courses: Course[];
}) {
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
            title: plan.name,
            href: show(plan).url,
        },
        {
            title: 'Edit',
            href: edit(plan).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Plan" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Plan ${plan.name} info`} />
                <EditPlanForm plan={plan} courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditPlanForm({ plan, courses }: { plan: Plan; courses: Course[] }) {
    return <PlanForm type="edit" courses={courses} plan={plan} />;
}
