import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, index, show } from '@/routes/teacher/course';
import { BreadcrumbItem, Course } from '@/types';
import { Head } from '@inertiajs/react';
import CourseForm from './form';

export default function Edit({ course }: { course: Course }) {
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
            href: show(course).url,
        },
        {
            title: 'Edit',
            href: edit(course).url,
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
    return <CourseForm type="edit" course={course} />;
}
