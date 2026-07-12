import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { TeacherCourseForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index, show as teacher_show } from '@/routes/admin/teacher';
import { index as courses, create } from '@/routes/admin/teacher/course';
import { BreadcrumbItem, Teacher } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({ teacher }: { teacher: Teacher }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Teacher',
            href: index().url,
        },
        {
            title: teacher.user?.name || teacher.id.toString(),
            href: teacher_show(teacher).url,
        },
        {
            title: 'Courses',
            href: courses(teacher).url,
        },
        {
            title: 'Create',
            href: create(teacher).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Course" />
                <TeacherCourseForm teacher={teacher} />
            </DashboardContainer>
        </AppLayout>
    );
}
