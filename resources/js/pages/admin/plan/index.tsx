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
import { create, destroy, edit, index, show } from '@/routes/admin/plan';
import { index as students } from '@/routes/admin/plan/enrollment';
import { index as orders } from '@/routes/admin/plan/order';
import { BreadcrumbItem, Plan } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, File, Pen, TableRowsSplit, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Plan',
        href: index().url,
    },
];

export default function Index({ plans }: { plans: Plan[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plan List" />
            <DashboardContainer>
                <DashboardHeader header="Plan List">
                    <CreateHeaderButton href={create().url} model="plan" />
                </DashboardHeader>
                <ResponsivePlanList plans={plans} />
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
                { header: 'Course', cell: (plan) => plan.course?.title },
                {
                    header: 'Teacher',
                    cell: (plan) => plan.course?.teacher?.user?.name,
                },
                { header: 'Plan', cell: (plan) => plan.name },
                { header: 'Price', cell: (plan) => plan.price },
                { header: 'Order Count', cell: (plan) => plan.orders_count },
                {
                    header: 'Student Count',
                    cell: (plan) => plan.students_count,
                },
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
            {!(plan.orders_count || plan.students_count) && (
                <FormButton
                    className="inline"
                    form={destroy.form(plan)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={students(plan).url}>
                <TableRowsSplit />
            </ButtonLink>
            <ButtonLink href={orders(plan).url}>
                <File />
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
