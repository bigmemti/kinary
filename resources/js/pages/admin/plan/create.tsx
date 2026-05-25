import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Course } from "@/types";
import { PlanForm } from "@/components/forms";
import { create, index } from "@/routes/admin/plan";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Plan',
        href: index().url
    },
    {
        title: 'Create',
        href: create().url
    }
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
    return <PlanForm type="create" courses={courses} />
}
