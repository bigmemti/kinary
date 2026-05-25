import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { create, destroy, edit, index, show } from "@/routes/admin/content";
import { BreadcrumbItem, Content } from "@/types";
import { Head } from "@inertiajs/react";
import { Eye, Pen, Trash } from "lucide-react";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import ResponsiveDataList from "@/components/responsive-data-list";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Content',
        href: index().url
    }
];

export default function Index({ contents }: { contents: Content[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Content List"/>
            <DashboardContainer>
                <DashboardHeader header="Content List">
                    <CreateHeaderButton href={create().url} model="content" />
                </DashboardHeader>
                <ResponsiveContentList contents={contents} />
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
                { header: "Teacher", cell: (content) => content.lesson?.section?.course?.teacher?.user?.name, },
                { header: "Course", cell: (content) => content.lesson?.section?.course?.title, },
                { header: "Section", cell: (content) => content.lesson?.section?.name, },
                { header: "Lesson", cell: (content) => content.lesson?.name, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (content) => <ContentActions content={content} /> },
            ]}
        />
    );
}

function ContentActions({ content }: { content: Content}) {
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