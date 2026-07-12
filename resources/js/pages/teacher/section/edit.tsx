import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { SectionForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/course/section';
import { edit, show } from '@/routes/teacher/section';
import { BreadcrumbItem, Course, Section } from '@/types';
import { Head } from '@inertiajs/react';

export default function Edit({
    section,
    courses,
}: {
    section: Section;
    courses: Course[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Section',
            href: index(section.course_id).url,
        },
        {
            title: section.name,
            href: show(section).url,
        },
        {
            title: 'Edit',
            href: edit(section).url,
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

function EditSectionForm({
    section,
    courses,
}: {
    section: Section;
    courses: Course[];
}) {
    return <SectionForm type="edit" courses={courses} section={section} />;
}
