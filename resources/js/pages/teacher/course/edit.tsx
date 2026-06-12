import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import CourseForm from "./form";
import { BreadcrumbItem, Course } from "@/types";
import { edit, index, show } from "@/routes/teacher/course";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";

export default function Edit({ course }: { course: Course }) {
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
            title: course.title,
            href: show(course).url
        },
        {
            title: 'Edit',
            href: edit(course).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Course" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Course ${course.title} info`} />
                <EditCourseForm course={course} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditCourseForm({ course }: { course: Course }) {
    return <CourseForm type="edit" course={course} />
}

