import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { SectionForm } from "@/components/forms";
import { create, index } from "@/routes/admin/section";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Section',
        href: index().url
    },
    {
        title: 'Create',
        href: create().url
    }
];

export default function Create({ courses }: { courses: User[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Section User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Section" />
                <CreateSectionForm courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateSectionForm({ courses }: { courses: User[] }) {
    return <SectionForm type="create" courses={courses} />
}
