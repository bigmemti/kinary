import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Section, Course } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, Layers, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { create, index as sections } from "@/routes/admin/course/section";
import { index, show as course_show } from "@/routes/admin/course";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { destroy, edit, show } from "@/routes/admin/section";
import { index as lessons } from "@/routes/admin/section/lesson";

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
            title: 'Sections',
            href: sections(course).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Course List"/>
            <DashboardContainer>
                <DashboardHeader header={`Course ${course.title} Sections List`}>
                    <CreateHeaderButton href={create(course).url} model="section" />
                </DashboardHeader>
                {(!!course.sections && course.sections?.length > 0) && <ResponsiveSectionList sections={course.sections} />}
            </DashboardContainer>
        </AppLayout>
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
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (section) => <SectionActions section={section} /> },
            ]}
        />
    );
}

function SectionActions({ section }: { section: Section }) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            {!section.lessons_count && (
                <FormButton className="inline" form={destroy.form(section)} options={{ preserveScroll: true }}>
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={lessons(section).url}>
                <Layers />
            </ButtonLink>
            <ButtonLink href={edit(section).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(section).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}