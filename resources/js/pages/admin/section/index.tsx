import ButtonLink from '@/components/button-link';
import {
    CreateHeaderButton,
    DashboardContainer,
    DashboardHeader,
} from '@/components/dashboard';
import FormButton from '@/components/form-button';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, destroy, edit, index, show } from '@/routes/admin/section';
import { index as lessons } from '@/routes/admin/section/lesson';
import { BreadcrumbItem, Section } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, File, Pen, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Section',
        href: index().url,
    },
];

export default function Index({ sections }: { sections: Section[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Section List" />
            <DashboardContainer>
                <DashboardHeader header="Section List">
                    <CreateHeaderButton href={create().url} model="section" />
                </DashboardHeader>
                <ResponsiveSectionList sections={sections} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveSectionList({ sections }: { sections: Section[] }) {
    return (
        <ResponsiveDataList
            data={sections}
            columns={[
                { header: 'ID', cell: (section) => section.id },
                { header: 'Course', cell: (section) => section.course?.title },
                {
                    header: 'Teacher',
                    cell: (section) => section.course?.teacher?.user?.name,
                },
                { header: 'Section', cell: (section) => section.name },
                {
                    header: 'Lesson Count',
                    cell: (section) => section.lessons_count,
                },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (section) => <SectionActions section={section} />,
                },
            ]}
        />
    );
}

function SectionActions({ section }: { section: Section }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            {!section.lessons_count && (
                <FormButton
                    className="inline"
                    form={destroy.form(section)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
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
