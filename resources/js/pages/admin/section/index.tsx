import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Section } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, File, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as lessons } from "@/routes/admin/section/lesson";
import { create, destroy, edit, index, show } from "@/routes/admin/section";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Section',
        href: index().url
    }
];

export default function Index({ sections }: { sections: Section[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Section List"/>
            <DashboardContainer>
                <DashboardHeader header="Section List">
                    <CreateHeaderButton href={create().url} model="section" />
                </DashboardHeader>
                <ResponsiveSectionList sections={sections} />
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
                { header: "Course", cell: (section) => section.course?.title, },
                { header: "Teacher", cell: (section) => section.course?.teacher?.user?.name, },
                { header: "Section", cell: (section) => section.name, },
                { header: "Lesson Count", cell: (section) => section.lessons_count, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (section) => <SectionActions section={section} /> },
            ]}
        />
    );
}

function SectionActions({ section }: { section: Section}) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            {!section.lessons_count && (
                    <FormButton className="inline" form={destroy.form(section)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
            <ButtonLink href={lessons(section).url}>
                <File />
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