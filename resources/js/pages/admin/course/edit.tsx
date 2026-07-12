import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { CourseForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { edit, index, show } from '@/routes/admin/course';
import { BreadcrumbItem, Course, Teacher } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    course,
    teachers,
}: {
    course: Course;
    teachers: Teacher[];
}) {
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
                <EditCourseForm course={course} teachers={teachers} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditCourseForm({
    course,
    teachers,
}: {
    course: Course;
    teachers: Teacher[];
}) {
    return <CourseForm type="edit" teachers={teachers} course={course} />;
}
