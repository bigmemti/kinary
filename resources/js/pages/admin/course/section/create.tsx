import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Course } from "@/types";
import { create, index as sections } from "@/routes/admin/course/section";
import { index, show as course_show } from "@/routes/admin/course";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { CourseSectionForm } from "@/components/forms";

export default function Create({ course}: { course: Course }) {
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
            href: course_show(course).url
        },
        {
            title: 'Sections',
            href: sections(course).url
        },
        {
            title: 'Create',
            href: create(course).url
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Section" />
                <CourseSectionForm course={course} />
            </DashboardContainer>
        </AppLayout>
    );
}
