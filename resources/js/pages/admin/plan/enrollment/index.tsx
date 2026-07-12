import ButtonLink from '@/components/button-link';
import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import FormButton from '@/components/form-button';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { destroy, edit, show } from '@/routes/admin/enrollment';
import { index, show as plan_show } from '@/routes/admin/plan';
import { index as enrollments } from '@/routes/admin/plan/enrollment';
import { show as student_show } from '@/routes/admin/student';
import { BreadcrumbItem, Plan, Student } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, GraduationCap, Pen, Trash } from 'lucide-react';

export default function Index({ plan }: { plan: Plan }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Plan',
            href: index().url,
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
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            <FormButton
                className="inline"
                form={destroy.form(student.pivot?.id)}
                options={{ preserveScroll: true }}
            >
                <Trash />
            </FormButton>
            <ButtonLink href={student_show(student).url}>
                <GraduationCap />
            </ButtonLink>
            <ButtonLink href={edit(student.pivot?.id).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(student.pivot?.id).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
