import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Content, Lesson } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, Pen, Trash } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { create, index as contents } from "@/routes/admin/lesson/content";
import { index, show as lesson_show } from "@/routes/admin/lesson";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import { destroy, edit, show } from "@/routes/admin/content";

export default function Index({ lesson }: { lesson: Lesson }){
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
            href: lesson_show(lesson).url
        },
        {
            title: 'Contents',
            href: contents(lesson).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Lesson Content List"/>
            <DashboardContainer>
                <DashboardHeader header={`Lesson ${lesson.name} Contents List`}>
                    <CreateHeaderButton href={create(lesson).url} model="content" />
                </DashboardHeader>
                {(!!lesson.contents && lesson.contents?.length > 0) &&<ResponsiveContentList contents={lesson.contents} />}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveContentList({ contents }: { contents: Content[]}) {
    return (
        <ResponsiveDataList
            data={contents}
            columns={[
                { header: "ID", cell: (content) => content.id, },
                { header: "Body", cell: (content) => content.body, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (content) => <ContentActions content={content} /> },
            ]}
        />
    );
}

function ContentActions({ content }: { content: Content }) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            <FormButton className="inline" form={destroy.form(content)} options={{ preserveScroll: true }}>
                <Trash />
            </FormButton>
            <ButtonLink href={edit(content).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(content).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}