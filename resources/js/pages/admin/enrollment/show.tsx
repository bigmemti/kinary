import ButtonLink from "@/components/button-link";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { destroy, edit, index, show } from "@/routes/admin/enrollment";
import { show as course } from "@/routes/admin/course";
import { show as plan } from "@/routes/admin/plan";
import { show as student } from "@/routes/admin/student";
import { BreadcrumbItem, Enrollment } from "@/types";
import { Head } from "@inertiajs/react";
import { Book, GraduationCap, Layers, Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ enrollment }: { enrollment: Enrollment }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Enrollment',
            href: index().url
        },
        {
            title: enrollment.id.toString(),
            href: show(enrollment).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Enrollment" />
            <DashboardContainer>
                <DashboardHeader header={`Show ${enrollment.id} info`}>
                    <EnrollmentActions enrollment={enrollment} />
                </DashboardHeader>
                <DataContainer>
                    <EnrollmentMeta enrollment={enrollment} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function EnrollmentMeta({ enrollment }: { enrollment: Enrollment }) {
    return(
        <>
            <InfoBlock label="ID" value={enrollment.id} />
            <InfoBlock label="Student Name" value={enrollment.student?.user?.name} />
            <InfoBlock label="Course Title" value={enrollment.plan?.course?.title} />
            <InfoBlock label="Plan Name" value={enrollment.plan?.name} />
            <InfoBlock label="Teacher Name" value={enrollment.plan?.course?.teacher?.user?.name} />
            <InfoBlock label="Created At" value={enrollment.created_at} />
            <InfoBlock label="Updated At" value={enrollment.updated_at} />
        </>
    );
}

function EnrollmentActions({ enrollment }: { enrollment: Enrollment}) {
    return (
        <ActionButtonContainer>
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
        </ActionButtonContainer>
    );
}