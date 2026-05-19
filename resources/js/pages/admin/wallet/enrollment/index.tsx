import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Enrollment, Student } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Book, Eye, Layers, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { create, index as enrollments } from "@/routes/admin/student/enrollment";
import { index, show as student_show } from "@/routes/admin/student";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { destroy, edit, show } from "@/routes/admin/enrollment";
import { show as plan } from "@/routes/admin/plan";
import { show as course } from "@/routes/admin/course";

export default function Index({ student }: { student: Student }){
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
            title: student.user?.name ||  student.id.toString(),
            href: student_show(student).url
        },
        {
            title: 'Enrollments',
            href: enrollments(student).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Student List"/>
            <DashboardContainer>
                <DashboardHeader header={`Student ${student.user?.name} Enrollments List`}>
                    <CreateHeaderButton href={create(student).url} model="enrollment" />
                </DashboardHeader>
                <ResponsiveEnrollmentList enrollments={student.enrollments} />
            </DashboardContainer>
        </AppLayout>
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
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (enrollment) => <EnrollmentActions enrollment={enrollment} /> },
            ]}
        />
    );
}

function EnrollmentActions({ enrollment }: { enrollment: Enrollment }) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            <FormButton className="inline" form={destroy.form(enrollment)} options={{ preserveScroll: true }}>
                <Trash />
            </FormButton>
            <ButtonLink href={plan(enrollment.plan_id).url}>
                <Layers />
            </ButtonLink>
            <ButtonLink href={course(enrollment.plan?.course_id ?? 0).url}>
                <Book />
            </ButtonLink>
            <ButtonLink href={edit(enrollment).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(enrollment).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}