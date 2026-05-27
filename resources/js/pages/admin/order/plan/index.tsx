import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Plan, Order } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, File, GraduationCap, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as plans } from "@/routes/admin/order/plan";
import { index as orders } from "@/routes/admin/plan/order";
import { index as enrollments } from "@/routes/admin/plan/enrollment";
import { index, show as order_show } from "@/routes/admin/order";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { destroy, edit, show } from "@/routes/admin/plan";

export default function Index({ order }: { order: Order }){
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Order',
            href: index().url
        },
        {
            title: order.id.toString(),
            href: order_show(order).url
        },
        {
            title: 'Plans',
            href: plans(order).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Order List"/>
            <DashboardContainer>
                <DashboardHeader header={`Order ${order.id.toString()} Plans List`} />
                {(!!order.plans && order.plans?.length > 0) && <ResponsivePlanList plans={order.plans} />}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsivePlanList({ plans }: { plans: Plan[]}) {
    return (
        <ResponsiveDataList
            data={plans}
            columns={[
                { header: "ID", cell: (plan) => plan.id, },
                { header: "Course", cell: (plan) => plan.course?.title, },
                { header: "Plan", cell: (plan) => plan.name, },
                { header: "Teacher", cell: (plan) => plan.course?.teacher?.user?.name, },
                { header: "Price", cell: (plan) => plan.price, },
                { header: "Student Count", cell: (plan) => plan.students_count, },
                { header: "Order Count", cell: (plan) => plan.orders_count, },
                { header: "Created At", cell: (plan) => plan.created_at, },
                { header: "Updated At", cell: (plan) => plan.updated_at, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (plan) => <PlanActions plan={plan} /> },
            ]}
        />
    );
}

function PlanActions({ plan }: { plan: Plan }) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            { !(plan.students_count || plan.orders_count) && (
                    <FormButton className="inline" form={destroy.form(plan)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={orders(plan).url}>
                <File />
            </ButtonLink>
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