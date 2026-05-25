import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { SectionForm } from "@/components/forms";
import { BreadcrumbItem, Section, Course } from "@/types";
import { edit, index, show } from "@/routes/admin/section";
import { DashboardContainer, DashboardHeader } from "@/components/dashboard";

export default function Edit({ section, courses }: { section: Section, courses: Course[] }) {
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
        {
            title: 'Edit',
            href: edit(section).url
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Section" />
            <DashboardContainer>
                <DashboardHeader header={`Edit Section ${section.name} info`} />
                <EditSectionForm section={section} courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function EditSectionForm({ section, courses }: { section: Section, courses: Course[] }) {
    return <SectionForm type="edit" courses={courses} section={section} />
}

