import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { TeacherForm } from "@/components/forms";
import { BreadcrumbItem, Teacher, User } from "@/types";
import { edit, index, show } from "@/routes/admin/teacher";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";

export default function Edit({ teacher, users }: { teacher: Teacher, users: User[] }) {
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
            title: teacher.user?.name?? teacher.id.toString(),
            href: show(teacher).url
        },
        {
            title: 'Edit',
            href: edit(teacher).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Teacher" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Teacher ${teacher.user?.name?? teacher.id} info`} />
                <EditTeacherForm teacher={teacher} users={users} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditTeacherForm({ teacher, users }: { teacher: Teacher, users: User[] }) {
    return <TeacherForm type="edit" users={users} teacher={teacher} />
}

