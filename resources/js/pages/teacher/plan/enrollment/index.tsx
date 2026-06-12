import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Plan, Student } from "@/types";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as enrollments } from "@/routes/teacher/plan/enrollment";
import { show as plan_show } from "@/routes/teacher/plan";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { index } from "@/routes/teacher/course/plan";

export default function Index({ plan }: { plan: Plan }){
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
            href: plan_show(plan).url
        },
        {
            title: 'Enrollments',
            href: enrollments(plan).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Plan List"/>
            <DashboardContainer>
                <DashboardHeader header={`Plan ${plan.name} Enrollments List`} />
                {(!!plan.students && plan.students?.length > 0) && <ResponsiveEnrollmentList students={plan.students} />}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveEnrollmentList({ students }: { students: Student[]}) {
    return (
        <ResponsiveDataList
            data={students}
            columns={[
                { header: "ID", cell: (student) => student.pivot?.id, },
                { header: "Student ID", cell: (student) => student.id, },
                { header: "Student Name", cell: (student) => student.user?.name, },
                { header: "Created At", cell: (student) => student.pivot?.created_at, },
                { header: "Updated At", cell: (student) => student.pivot?.updated_at, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (student) => <EnrollmentActions student={student} /> },
            ]}
        />
    );
}

function EnrollmentActions({ student }: { student: Student }) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            
        </div>
    );
}