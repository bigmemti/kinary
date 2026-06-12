import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import PlanForm from "./form";
import { BreadcrumbItem, Plan } from "@/types";
import { edit, show } from "@/routes/teacher/plan";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { index } from "@/routes/teacher/course/plan";

export default function Edit({ plan }: { plan: Plan }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Plan',
            href: index(plan.course_id).url
        },
        {
            title: plan.name,
            href: show(plan).url
        },
        {
            title: 'Edit',
            href: edit(plan).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Plan" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Plan ${plan.name} info`} />
                <EditPlanForm plan={plan} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditPlanForm({ plan }: { plan: Plan }) {
    return <PlanForm type="edit" plan={plan} />
}

