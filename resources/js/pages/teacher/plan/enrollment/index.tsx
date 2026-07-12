import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index } from '@/routes/teacher/course/plan';
import { show as plan_show } from '@/routes/teacher/plan';
import { index as enrollments } from '@/routes/teacher/plan/enrollment';
import { BreadcrumbItem, Plan, Student } from '@/types';
import { Head } from '@inertiajs/react';

export default function Index({ plan }: { plan: Plan }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Plan',
            href: index(plan.course_id).url,
        },
        {
            title: plan.name,
            href: plan_show(plan).url,
        },
        {
            title: 'Enrollments',
            href: enrollments(plan).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plan List" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Plan ${plan.name} Enrollments List`}
                />
                {!!plan.students && plan.students?.length > 0 && (
                    <ResponsiveEnrollmentList students={plan.students} />
                )}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveEnrollmentList({ students }: { students: Student[] }) {
    return (
        <ResponsiveDataList
            data={students}
            columns={[
                { header: 'ID', cell: (student) => student.pivot?.id },
                { header: 'Student ID', cell: (student) => student.id },
                {
                    header: 'Student Name',
                    cell: (student) => student.user?.name,
                },
                {
                    header: 'Created At',
                    cell: (student) => student.pivot?.created_at,
                },
                {
                    header: 'Updated At',
                    cell: (student) => student.pivot?.updated_at,
                },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (student) => <EnrollmentActions student={student} />,
                },
            ]}
        />
    );
}

function EnrollmentActions({ student }: { student: Student }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end"></div>
    );
}
