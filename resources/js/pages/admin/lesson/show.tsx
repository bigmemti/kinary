import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ButtonLink from "@/components/button-link";
import { destroy, edit, index, show } from "@/routes/admin/lesson";
import { show as lesson } from "@/routes/admin/lesson";
import { BreadcrumbItem, Content, Lesson } from "@/types";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as contents } from "@/routes/admin/lesson/content";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ lesson }: { lesson: Lesson}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Lesson',
            href: index().url
        },
        {
            title: lesson.name,
            href: show(lesson).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Lesson" />
            <DashboardContainer>
                <DashboardHeader header={`Show Lesson ${lesson.name} info`} >
                    <LessonActions lesson={lesson} />
                </DashboardHeader>
                <DataContainer>
                    <LessonMeta lesson={lesson} />
                    <ContentsInfo lesson={lesson} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function ContentsInfo({ lesson }: { lesson: Lesson }) {
    return (
        <>
            <DashboardHeader header={`Content info`} containerClassName="my-4">
                <ContentActions lesson={lesson} />
            </DashboardHeader>
            <ContentsMeta lesson={lesson} />
            {(!!lesson.contents && lesson.contents?.length > 0) && <ResponsiveContentList contents={lesson.contents} />}
        </>
    );
}

function ResponsiveContentList({ contents }: { contents: Content[]}) {
    return (
        <ResponsiveDataList
            data={contents}
            columns={[
                { header: "ID", cell: (content) => content.id, }, 
                { header: "Created At", cell: (content) => content.created_at, },
                { header: "Updated At", cell: (content) => content.updated_at, },
            ]}
        />
    );
}

function ContentsMeta({ lesson }: { lesson: Lesson }) {
    return(
        <>
            <InfoBlock label="Contents Count" value={lesson.contents_count} />
        </>
    );
}

function ContentActions({ lesson }: { lesson: Lesson }) { 
    return (
        <ActionButtonContainer>
            <ButtonLink href={contents(lesson).url}>
                Contents
            </ButtonLink>
        </ActionButtonContainer>
    );
}

function LessonMeta({ lesson }: { lesson: Lesson }) {
    return(
        <>
            <InfoBlock label="ID" value={lesson.id} />
            <InfoBlock label="Name" value={lesson.name} />
            <InfoBlock label="Section ID" value={lesson.section?.id} />
            <InfoBlock label="Section" value={lesson.section?.name} />
            <InfoBlock label="Course ID" value={lesson.section?.course?.id} />
            <InfoBlock label="Course Title" value={lesson.section?.course?.title} />
            <InfoBlock label="Teacher" value={lesson.section?.course?.teacher?.user?.name} />
            <InfoBlock label="Teacher ID" value={lesson.section?.course?.teacher?.id} />
            <InfoBlock label="User ID" value={lesson.section?.course?.teacher?.user?.id} />
            <InfoBlock label="Created At" value={lesson.created_at} />
            <InfoBlock label="Updated At" value={lesson.updated_at} />
        </>
    );
}

function LessonActions({ lesson }: { lesson: Lesson}) {
    return (
        <ActionButtonContainer>
            {!lesson.contents_count && (
                    <FormButton className="inline" form={destroy.form(lesson)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={edit(lesson).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}