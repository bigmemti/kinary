import { DashboardContainer, DashboardHeader } from '@/components/dashboard';
import { SectionLessonForm } from '@/components/forms';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index } from '@/routes/teacher/course/section';
import { show as section_show } from '@/routes/teacher/section';
import { create, index as lessons } from '@/routes/teacher/section/lesson';
import { BreadcrumbItem, Section } from '@/types';
import { Head } from '@inertiajs/react';

export default function Create({ section }: { section: Section }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Section',
            href: index(section).url,
        },
        {
            title: section.name,
            href: section_show(section).url,
        },
        {
            title: 'Lessons',
            href: lessons(section).url,
        },
        {
            title: 'Create',
            href: create(section).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Section User" />
            <DashboardContainer>
                <DashboardHeader header="Create a new Lesson" />
                <SectionLessonForm section={section} />
            </DashboardContainer>
        </AppLayout>
    );
}
