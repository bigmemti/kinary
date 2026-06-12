import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Lesson, Section } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, Pen, ReceiptText, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { create, index as lessons } from "@/routes/teacher/section/lesson";
import { show as section_show } from "@/routes/teacher/section";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { destroy, edit, show } from "@/routes/teacher/lesson";
import { index as contents } from "@/routes/teacher/lesson/content";
import { index } from "@/routes/teacher/course/section";

export default function Index({ section }: { section: Section }){
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Section',
            href: index(section).url
        },
        {
            title: section.name,
            href: section_show(section).url
        },
        {
            title: 'Lessons',
            href: lessons(section).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Section Lesson List"/>
            <DashboardContainer>
                <DashboardHeader header={`Section ${section.name} Lessons List`}>
                    <CreateHeaderButton href={create(section).url} model="lesson" />
                </DashboardHeader>
                {(!!section.lessons && section.lessons?.length > 0) &&<ResponsiveLessonList lessons={section.lessons} />}
            </DashboardContainer>
        </AppLayout>
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
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (lesson) => <LessonActions lesson={lesson} /> },
            ]}
        />
    );
}

function LessonActions({ lesson }: { lesson: Lesson }) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            {!lesson.contents_count && (
                <FormButton className="inline" form={destroy.form(lesson)} options={{ preserveScroll: true }}>
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={contents(lesson).url}>
                <ReceiptText />
            </ButtonLink>
            <ButtonLink href={edit(lesson).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(lesson).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}