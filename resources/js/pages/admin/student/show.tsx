import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ButtonLink from "@/components/button-link";
import { destroy, edit, index, show } from "@/routes/admin/student";
import { BreadcrumbItem, Enrollment, Student } from "@/types";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as enrollments } from "@/routes/admin/student/enrollment";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ student }: { student: Student}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Student',
            href: index().url
        },
        {
            title: student.user?.name ?? student.id.toString(),
            href: show(student).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Student" />
            <DashboardContainer>
                <DashboardHeader header={`Show Student ${student.user?.name?? student.id} info`} >
                    <StudentActions student={student} />
                </DashboardHeader>
                <DataContainer>
                    <StudentMeta student={student} />
                    <EnrollmentsInfo student={student} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function EnrollmentsInfo({ student }: { student: Student }) {
    return (
        <>
            <DashboardHeader header={`Enrollment info`} containerClassName="my-4">
                <EnrollmentActions student={student} />
            </DashboardHeader>
            <EnrollmentsMeta student={student} />
            {(!!student.enrollments && student.enrollments?.length > 0) && <ResponsiveEnrollmentList enrollments={student.enrollments} />}
        </>
    );
}

function ResponsiveEnrollmentList({ enrollments }: { enrollments: Enrollment[]}) {
    return (
        <ResponsiveDataList
            data={enrollments}
            columns={[
                { header: "ID", cell: (enrollment) => enrollment.id, },
                { header: "Course", cell: (enrollment) => enrollment.plan?.course?.title, },
                { header: "Teacher", cell: (enrollment) => enrollment.plan?.course?.teacher?.user?.name, },
                { header: "Plan", cell: (enrollment) => enrollment.plan?.name, },
                { header: "Created At", cell: (enrollment) => enrollment.created_at, },
                { header: "Updated At", cell: (enrollment) => enrollment.updated_at, },
            ]}
        />
    );
}

function EnrollmentsMeta({ student }: { student: Student }) {
    return(
        <>
            <InfoBlock label="Enrollments Count" value={student.enrollments_count} />
        </>
    );
}

function EnrollmentActions({ student }: { student: Student }) { 
    return (
        <ActionButtonContainer>
            <ButtonLink href={enrollments(student).url}>
                Enrollments
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function StudentMeta({ student }: { student: Student }) {
    return(
        <>
            <InfoBlock label="ID" value={student.id} />
            <InfoBlock label="User ID" value={student.user?.id} />
            <InfoBlock label="User Name" value={student.user?.name} />
            <InfoBlock label="Created At" value={student.created_at} />
            <InfoBlock label="Updated At" value={student.updated_at} />
        </>
    );
}

function StudentActions({ student }: { student: Student}) {
    return (
        <ActionButtonContainer>
            {!!student.enrollments_count && (
                    <FormButton className="inline" form={destroy.form(student)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(student).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}