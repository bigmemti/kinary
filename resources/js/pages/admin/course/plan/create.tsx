import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { CoursePlanForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { show as course_show, index } from '@/routes/admin/course';
import { create, index as plans } from '@/routes/admin/course/plan';
import { BreadcrumbItem, Course } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({ course }: { course: Course }) {
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
            href: course_show(course).url,
        },
        {
            title: 'Plans',
            href: plans(course).url,
        },
        {
            title: 'Create',
            href: create(course).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create a plan for ${course.title} Course`} />
            <DashboardContainer>
                <DashboardHeader header="Create a new Plan" />
                <CoursePlanForm course={course} />
            </DashboardContainer>
        </AppLayout>
    );
}
