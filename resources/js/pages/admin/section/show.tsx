import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ButtonLink from "@/components/button-link";
import { destroy, edit, index, show } from "@/routes/admin/section";
import { BreadcrumbItem, Lesson, Section } from "@/types";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as lessons } from "@/routes/admin/section/lesson";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ section }: { section: Section}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Section',
            href: index().url
        },
        {
            title: section.name,
            href: show(section).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Section" />
            <DashboardContainer>
                <DashboardHeader header={`Show Section ${section.name} info`} >
                    <SectionActions section={section} />
                </DashboardHeader>
                <DataContainer>
                    <SectionMeta section={section} />
                    <LessonsInfo section={section} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function LessonsInfo({ section }: { section: Section }) {
    return (
        <>
            <DashboardHeader header={`Lesson info`} containerClassName="my-4">
                <LessonActions section={section} />
            </DashboardHeader>
            <LessonsMeta section={section} />
            {(!!section.lessons && section.lessons?.length > 0) && <ResponsiveLessonList lessons={section.lessons} />}
        </>
    );
}

function ResponsiveLessonList({ lessons }: { lessons: Lesson[]}) {
    return (
        <ResponsiveDataList
            data={lessons}
            columns={[
                { header: "ID", cell: (lesson) => lesson.id, },
                { header: "Lesson", cell: (lesson) => lesson.name, },
                { header: "Content Count", cell: (lesson) => lesson.contents_count, },
                { header: "Created At", cell: (lesson) => lesson.created_at, },
                { header: "Updated At", cell: (lesson) => lesson.updated_at, },
            ]}
        />
    );
}

function LessonsMeta({ section }: { section: Section }) {
    return(
        <>
            <InfoBlock label="Lessons Count" value={section.lessons_count} />
        </>
    );
}

function LessonActions({ section }: { section: Section }) { 
    return (
        <ActionButtonContainer>
            <ButtonLink href={lessons(section).url}>
                Lessons
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function SectionMeta({ section }: { section: Section }) {
    return(
        <>
            <InfoBlock label="ID" value={section.id} />
            <InfoBlock label="Name" value={section.name} />
            <InfoBlock label="Course ID" value={section.course?.id} />
            <InfoBlock label="Course Title" value={section.course?.title} />
            <InfoBlock label="Teacher" value={section.course?.teacher?.user?.name} />
            <InfoBlock label="Teacher ID" value={section.course?.teacher?.id} />
            <InfoBlock label="User ID" value={section.course?.teacher?.user?.id} />
            <InfoBlock label="Created At" value={section.created_at} />
            <InfoBlock label="Updated At" value={section.updated_at} />
        </>
    );
}

function SectionActions({ section }: { section: Section}) {
    return (
        <ActionButtonContainer>
            {!section.lessons_count && (
                    <FormButton className="inline" form={destroy.form(section)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(section).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}