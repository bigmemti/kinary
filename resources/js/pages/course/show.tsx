import { DashboardContainer } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index } from "@/routes/course";
import { BreadcrumbItem, Course } from "@/types";
import { Head } from "@inertiajs/react";

export default function Show({ course }: { course: Course}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Course',
            href: index().url,
        },
        {
            title: course.title,
            href: index().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title} />
            <DashboardContainer>
                <div>
                    <div>{course.id}</div>
                    <div>{course.title}</div>
                    <div>{course.slug}</div>
                    <div>{course.description}</div>
                    <div>{course.thumbnail}</div>
                    <div>{course.intro_video_url}</div>
                    <div>{course.status}</div>
                    <div>{course.created_at}</div>
                    <div>{course.updated_at}</div>
                    <div>{course.deleted_at}</div>
                </div>
            </DashboardContainer>
        </AppLayout>
    );
}