import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { show as course_show, index } from '@/routes/admin/course';
import { create, index as spaces } from '@/routes/admin/course/space';
import { BreadcrumbItem, Course } from '@/types';
import { Head } from '@inertiajs/react';
import  CourseSpaceForm  from './form';

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
            title: 'Spaces',
            href: spaces(course).url,
        },
        {
            title: 'Create',
            href: create(course).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create a space for ${course.title} Course`} />
            <DashboardContainer>
                <DashboardHeader header="Create a new Space" />
                <CourseSpaceForm course={course} />
            </DashboardContainer>
        </AppLayout>
    );
}
