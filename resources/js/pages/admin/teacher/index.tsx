import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Teacher } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, File, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as courses } from "@/routes/admin/teacher/course";
import { create, destroy, edit, index, show } from "@/routes/admin/teacher";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Teacher',
        href: index().url
    }
];

export default function Index({ teachers }: { teachers: Teacher[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Teacher List"/>
            <DashboardContainer>
                <DashboardHeader header="Teacher List">
                    <CreateHeaderButton href={create().url} model="teacher" />
                </DashboardHeader>
                <ResponsiveTeacherList teachers={teachers} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveTeacherList({ teachers }: { teachers: Teacher[]}) {
    return (
        <ResponsiveDataList
            data={teachers}
            columns={[
                { header: "ID", cell: (teacher) => teacher.id, },
                { header: "User ID", cell: (teacher) => teacher.user?.id, },
                { header: "User Name", cell: (teacher) => teacher.user?.name, },
                { header: "Course Count", cell: (teacher) => teacher.courses_count, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (teacher) => <TeacherActions teacher={teacher} /> },
            ]}
        />
    );
}

function TeacherActions({ teacher }: { teacher: Teacher}) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            {teacher.courses_count ?
                (
                    <ButtonLink href={courses(teacher).url}>
                        <File />
                    </ButtonLink>
                ) : (
                    <FormButton className="inline" form={destroy.form(teacher)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(teacher).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(teacher).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}