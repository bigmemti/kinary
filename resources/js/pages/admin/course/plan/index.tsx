import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Plan, Course } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, File, GraduationCap, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { create, index as plans } from "@/routes/admin/course/plan";
import { index as orders } from "@/routes/admin/plan/order";
import { index as enrollments } from "@/routes/admin/plan/enrollment";
import { index, show as course_show } from "@/routes/admin/course";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { destroy, edit, show } from "@/routes/admin/plan";

export default function Index({ course }: { course: Course }){
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Course',
            href: index().url
        },
        {
            title: course.title,
            href: course_show(course).url
        },
        {
            title: 'Plans',
            href: plans(course).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Course List"/>
            <DashboardContainer>
                <DashboardHeader header={`Course ${course.title} Plans List`}>
                    <CreateHeaderButton href={create(course).url} model="plan" />
                </DashboardHeader>
                {(!!course.plans && course.plans?.length > 0) && <ResponsivePlanList plans={course.plans} />}
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
                { header: "Plan", cell: (plan) => plan.name, },
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