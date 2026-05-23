import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Teacher } from "@/types";
import { CourseForm } from "@/components/forms";
import { create, index } from "@/routes/admin/course";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Course',
        href: index().url
    },
    {
        title: 'Create',
        href: create().url
    }
];

export default function Create({ teachers }: { teachers: Teacher[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Teacher" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Course" />
                <CreateCourseForm teachers={teachers} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateCourseForm({ teachers }: { teachers: Teacher[] }) {
    return <CourseForm type="create" teachers={teachers} />
}
