import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Teacher } from "@/types";
import { create, index as courses } from "@/routes/admin/teacher/course";
import { index, show as teacher_show } from "@/routes/admin/teacher";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { TeacherCourseForm } from "@/components/forms";

export default function Create({ teacher}: { teacher: Teacher }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Teacher',
            href: index().url
        },
        {
            title: teacher.user?.name ||  teacher.id.toString(),
            href: teacher_show(teacher).url
        },
        {
            title: 'Courses',
            href: courses(teacher).url
        },
        {
            title: 'Create',
            href: create(teacher).url
        }
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
