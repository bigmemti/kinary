import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/teacher/course';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CourseForm from './form';

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
        title: 'Create',
        href: create().url,
    },
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
    return <CourseForm type="create" />;
}
