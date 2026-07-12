import ButtonLink from '@/components/button-link';
import {
    CreateHeaderButton,
    DashboardContainer,
    DashboardHeader,
} from '@/components/dashboard';
import FormButton from '@/components/form-button';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { show as course } from '@/routes/admin/course';
import { destroy, edit, show } from '@/routes/admin/enrollment';
import { show as plan } from '@/routes/admin/plan';
import { index, show as student_show } from '@/routes/admin/student';
import {
    create,
    index as enrollments,
} from '@/routes/admin/student/enrollment';
import { BreadcrumbItem, Enrollment, Student } from '@/types';
import { Head } from '@inertiajs/react';
import { Book, Eye, Layers, Pen, Trash } from 'lucide-react';

export default function Index({ student }: { student: Student }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Student',
            href: index().url,
        },
        {
            title: student.user?.name || student.id.toString(),
            href: student_show(student).url,
        },
        {
            title: 'Enrollments',
            href: enrollments(student).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student List" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Student ${student.user?.name} Enrollments List`}
                >
                    <CreateHeaderButton
                        href={create(student).url}
                        model="enrollment"
                    />
                </DashboardHeader>
                <ResponsiveEnrollmentList enrollments={student.enrollments} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveEnrollmentList({
    enrollments,
}: {
    enrollments: Enrollment[];
}) {
    return (
        <ResponsiveDataList
            data={enrollments}
            columns={[
                { header: 'ID', cell: (enrollment) => enrollment.id },
                {
                    header: 'Course',
                    cell: (enrollment) => enrollment.plan?.course?.title,
                },
                {
                    header: 'Teacher',
                    cell: (enrollment) =>
                        enrollment.plan?.course?.teacher?.user?.name,
                },
                { header: 'Plan', cell: (enrollment) => enrollment.plan?.name },
                {
                    header: 'Created At',
                    cell: (enrollment) => enrollment.created_at,
                },
                {
                    header: 'Updated At',
                    cell: (enrollment) => enrollment.updated_at,
                },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (enrollment) => (
                        <EnrollmentActions enrollment={enrollment} />
                    ),
                },
            ]}
        />
    );
}

function EnrollmentActions({ enrollment }: { enrollment: Enrollment }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            <FormButton
                className="inline"
                form={destroy.form(enrollment)}
                options={{ preserveScroll: true }}
            >
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
