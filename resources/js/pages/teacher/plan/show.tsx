import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ButtonLink from "@/components/button-link";
import { destroy, edit, show } from "@/routes/teacher/plan";
import { BreadcrumbItem, Student, Plan } from "@/types";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as students } from "@/routes/teacher/plan/enrollment";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";
import { index } from "@/routes/teacher/course/plan";

export default function Show({ plan }: { plan: Plan}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Plan',
            href: index(plan.course_id).url
        },
        {
            title: plan.name,
            href: show(plan).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Plan" />
            <DashboardContainer>
                <DashboardHeader header={`Show Plan ${plan.name} info`} >
                    <PlanActions plan={plan} />
                </DashboardHeader>
                <DataContainer>
                    <PlanMeta plan={plan} />
                    <StudentsInfo plan={plan} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function StudentsInfo({ plan }: { plan: Plan }) {
    return (
        <>
            <DashboardHeader header={`Student info`} containerClassName="my-4">
                <StudentActions plan={plan} />
            </DashboardHeader>
            <StudentsMeta plan={plan} />
            {(!!plan.students && plan.students?.length > 0) && <ResponsiveStudentList students={plan.students} />}
        </>
    );
}

function ResponsiveStudentList({ students }: { students: Student[]}) {
    return (
        <ResponsiveDataList
            data={students}
            columns={[
                { header: "ID", cell: (student) => student.id, },
                { header: "Student", cell: (student) => student.user?.name, },
                { header: "Created At", cell: (student) => student.created_at, },
                { header: "Updated At", cell: (student) => student.updated_at, },
            ]}
        />
    );
}

function StudentsMeta({ plan }: { plan: Plan }) {
    return(
        <>
            <InfoBlock label="Students Count" value={plan.students_count} />
        </>
    );
}

function StudentActions({ plan }: { plan: Plan }) { 
    return (
        <ActionButtonContainer>
            <ButtonLink href={students(plan).url}>
                Students
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function PlanMeta({ plan }: { plan: Plan }) {
    return(
        <>
            <InfoBlock label="ID" value={plan.id} />
            <InfoBlock label="Name" value={plan.name} />
            <InfoBlock label="Price" value={plan.price} />
            <InfoBlock label="Course ID" value={plan.course?.id} />
            <InfoBlock label="Course title" value={plan.course?.title} />
            <InfoBlock label="Created At" value={plan.created_at} />
            <InfoBlock label="Updated At" value={plan.updated_at} />
        </>
    );
}

function PlanActions({ plan }: { plan: Plan}) {
    return (
        <ActionButtonContainer>
            {!(plan.students_count || plan.orders_count) && (
                    <FormButton className="inline" form={destroy.form(plan)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(plan).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}