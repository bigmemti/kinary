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
import { show as course_show, index } from '@/routes/teacher/course';
import { create, index as plans } from '@/routes/teacher/course/plan';
import { destroy, edit, show } from '@/routes/teacher/plan';
import { index as enrollments } from '@/routes/teacher/plan/enrollment';
import { BreadcrumbItem, Course, Plan } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, GraduationCap, Pen, Trash } from 'lucide-react';

export default function Index({ course }: { course: Course }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Course',
            href: index().url,
        },
        {
            title: course.title,
            href: course_show(course).url,
        },
        {
            title: 'Plans',
            href: plans(course).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course List" />
            <DashboardContainer>
                <DashboardHeader header={`Course ${course.title} Plans List`}>
                    <CreateHeaderButton
                        href={create(course).url}
                        model="plan"
                    />
                </DashboardHeader>
                {!!course.plans && course.plans?.length > 0 && (
                    <ResponsivePlanList plans={course.plans} />
                )}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsivePlanList({ plans }: { plans: Plan[] }) {
    return (
        <ResponsiveDataList
            data={plans}
            columns={[
                { header: 'ID', cell: (plan) => plan.id },
                { header: 'Plan', cell: (plan) => plan.name },
                { header: 'Price', cell: (plan) => plan.price },
                {
                    header: 'Student Count',
                    cell: (plan) => plan.students_count,
                },
                { header: 'Order Count', cell: (plan) => plan.orders_count },
                { header: 'Created At', cell: (plan) => plan.created_at },
                { header: 'Updated At', cell: (plan) => plan.updated_at },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (plan) => <PlanActions plan={plan} />,
                },
            ]}
        />
    );
}

function PlanActions({ plan }: { plan: Plan }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            {!(plan.students_count || plan.orders_count) && (
                <FormButton
                    className="inline"
                    form={destroy.form(plan)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={enrollments(plan).url}>
                <GraduationCap />
            </ButtonLink>
            <ButtonLink href={edit(plan).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(plan).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
