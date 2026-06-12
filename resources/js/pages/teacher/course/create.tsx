import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import CourseForm from "./form";
import { create, index } from "@/routes/teacher/course";
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

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Course" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Course" />
                <CreateCourseForm />
            </DashboardContainer>
        </AppLayout>
    );
}

function CreateCourseForm() {
    return <CourseForm type="create" />
}
