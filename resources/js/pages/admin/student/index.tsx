import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Student } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, File, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as enrollments } from "@/routes/admin/student/enrollment";
import { create, destroy, edit, index, show } from "@/routes/admin/student";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Student',
        href: index().url
    }
];

export default function Index({ students }: { students: Student[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Student List"/>
            <DashboardContainer>
                <DashboardHeader header="Student List">
                    <CreateHeaderButton href={create().url} model="student" />
                </DashboardHeader>
                <ResponsiveStudentList students={students} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveStudentList({ students }: { students: Student[]}) {
    return (
        <ResponsiveDataList
            data={students}
            columns={[
                { header: "ID", cell: (student) => student.id, },
                { header: "User ID", cell: (student) => student.user?.id, },
                { header: "User Name", cell: (student) => student.user?.name, },
                { header: "Enrollment Count", cell: (student) => student.enrollments_count, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (student) => <StudentActions student={student} /> },
            ]}
        />
    );
}

function StudentActions({ student }: { student: Student}) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            {student.enrollments_count ?
                (
                    <ButtonLink href={enrollments(student).url}>
                        <File />
                    </ButtonLink>
                ) : (
                    <FormButton className="inline" form={destroy.form(student)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(student).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(student).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}