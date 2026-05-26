import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { create, destroy, edit, index, show } from "@/routes/admin/enrollment";
import { show as course } from "@/routes/admin/course";
import { show as plan } from "@/routes/admin/plan";
import { show as student } from "@/routes/admin/student";
import { BreadcrumbItem, Enrollment } from "@/types";
import { Head } from "@inertiajs/react";
import { Book, Eye, GraduationCap, Layers, Pen, Trash } from "lucide-react";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import ResponsiveDataList from "@/components/responsive-data-list";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Enrollment',
        href: index().url
    }
];

export default function Index({ enrollments }: { enrollments: Enrollment[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Enrollment List"/>
            <DashboardContainer>
                <DashboardHeader header="Enrollment List">
                    <CreateHeaderButton href={create().url} model="enrollment" />
                </DashboardHeader>
                <ResponsiveEnrollmentList enrollments={enrollments} />
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
                { header: "Student", cell: (enrollment) => enrollment.student?.user?.name, },
                { header: "Plan", cell: (enrollment) => enrollment.plan?.name, },
                { header: "Course", cell: (enrollment) => enrollment.plan?.course?.title, },
                { header: "Teacher", cell: (enrollment) => enrollment.plan?.course?.teacher?.user?.name, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (enrollment) => <EnrollmentActions enrollment={enrollment} /> },
            ]}
        />
    );
}

function EnrollmentActions({ enrollment }: { enrollment: Enrollment}) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            <FormButton className="inline" form={destroy.form(enrollment)} options={{ preserveScroll: true }}>
                <Trash />
            </FormButton>
            <ButtonLink href={course(enrollment.plan?.course_id?? 0).url}>
                <Book />
            </ButtonLink>
            <ButtonLink href={plan(enrollment.plan_id).url}>
                <Layers />
            </ButtonLink>
            <ButtonLink href={student(enrollment.student_id).url}>
                <GraduationCap />
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