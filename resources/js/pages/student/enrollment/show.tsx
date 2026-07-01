import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ButtonLink from "@/components/button-link";
import { destroy, edit, index, show } from "@/routes/teacher/course";
import { BreadcrumbItem, Section, Course, Plan } from "@/types";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as sections } from "@/routes/teacher/course/section";
import { index as plans } from "@/routes/teacher/course/plan";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ course }: { course: Course}) {
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
            href: show(course).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Course" />
            <DashboardContainer>
                <DashboardHeader header={`Show Course ${course.title} info`} >
                    <CourseActions course={course} />
                </DashboardHeader>
                <DataContainer>
                    <CourseMeta course={course} />
                    <SectionsInfo course={course} />
                    <PlansInfo course={course} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function PlansInfo({ course }: { course: Course }) {
    return (
        <>
            <DashboardHeader header={`Plan info`} containerClassName="my-4">
                <PlanActions course={course} />
            </DashboardHeader>
            <PlansMeta course={course} />
            {(!!course.plans && course.plans?.length > 0) && <ResponsivePlanList plans={course.plans} />}
        </>
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
                { header: "Created At", cell: (plan) => plan.created_at, },
                { header: "Updated At", cell: (plan) => plan.updated_at, },
            ]}
        />
    );
}

function PlansMeta({ course }: { course: Course }) {
    return(
        <>
            <InfoBlock label="Plans Count" value={course.plans_count} />
        </>
    );
}

function PlanActions({ course }: { course: Course }) { 
    return (
        <ActionButtonContainer>
            <ButtonLink href={plans(course).url}>
                Plans
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function SectionsInfo({ course }: { course: Course }) {
    return (
        <>
            <DashboardHeader header={`Section info`} containerClassName="my-4">
                <SectionActions course={course} />
            </DashboardHeader>
            <SectionsMeta course={course} />
            {(!!course.sections && course.sections?.length > 0) && <ResponsiveSectionList sections={course.sections} />}
        </>
    );
}

function ResponsiveSectionList({ sections }: { sections: Section[]}) {
    return (
        <ResponsiveDataList
            data={sections}
            columns={[
                { header: "ID", cell: (section) => section.id, },
                { header: "Section", cell: (section) => section.name, },
                { header: "Created At", cell: (section) => section.created_at, },
                { header: "Updated At", cell: (section) => section.updated_at, },
            ]}
        />
    );
}

function SectionsMeta({ course }: { course: Course }) {
    return(
        <>
            <InfoBlock label="Sections Count" value={course.sections_count} />
        </>
    );
}

function SectionActions({ course }: { course: Course }) { 
    return (
        <ActionButtonContainer>
            <ButtonLink href={sections(course).url}>
                Sections
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function CourseMeta({ course }: { course: Course }) {
    return(
        <>
            <InfoBlock label="ID" value={course.id} />
            <InfoBlock label="Created At" value={course.created_at} />
            <InfoBlock label="Updated At" value={course.updated_at} />
        </>
    );
}

function CourseActions({ course }: { course: Course}) {
    return (
        <ActionButtonContainer>
            {!!course.sections_count && (
                    <FormButton className="inline" form={destroy.form(course)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(course).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}