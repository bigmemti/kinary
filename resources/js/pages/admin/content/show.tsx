import ButtonLink from "@/components/button-link";
import { ActionButtonContainer, DashboardContainer, DashboardHeader, DataContainer, InfoBlock } from "@/components/dashboard";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { destroy, edit, index, show } from "@/routes/admin/content";
import { BreadcrumbItem, Content } from "@/types";
import { Head } from "@inertiajs/react";
import { Pen, Trash } from "lucide-react";
import FormButton from "@/components/form-button";

export default function Show({ content }: { content: Content }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url
        },
        {
            title: 'Content',
            href: index().url
        },
        {
            title: content.id.toString(),
            href: show(content).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Content" />
            <DashboardContainer>
                <DashboardHeader header={`Show ${content.id} info`}>
                    <ContentActions content={content} />
                </DashboardHeader>
                <DataContainer>
                    <ContentMeta content={content} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function ContentMeta({ content }: { content: Content }) {
    return(
        <>
            <InfoBlock label="ID" value={content.id} />
            <InfoBlock label="Lesson Name" value={content.lesson?.name} />
            <InfoBlock label="Section Name" value={content.lesson?.section?.name} />
            <InfoBlock label="Course Title" value={content.lesson?.section?.course?.title} />
            <InfoBlock label="Teacher Name" value={content.lesson?.section?.course?.teacher?.user?.name} />
            <InfoBlock label="Created At" value={content.created_at} />
            <InfoBlock label="Updated At" value={content.updated_at} />
            <InfoBlock label="Body" value={content.body} />
        </>
    );
}

function ContentActions({ content }: { content: Content}) {
    return (
        <ActionButtonContainer>
            <FormButton className="inline" form={destroy.form(content)} options={{ preserveScroll: true }}>
                <Trash />
            </FormButton>
            <ButtonLink href={edit(content).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}