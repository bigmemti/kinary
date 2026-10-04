import ButtonLink from '@/components/button-link';
import {
    ActionButtonContainer,
    DashboardContainer,
    DashboardHeader,
    DataContainer,
    InfoBlock,
} from '@/components/dashboard';
import FormButton from '@/components/form-button';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { destroy, edit, index, show } from '@/routes/admin/course';
import { index as spaces } from '@/routes/admin/course/space';
import { index as sections } from '@/routes/admin/course/section';
import { BreadcrumbItem, Course, Space, Section } from '@/types';
import { Head } from '@inertiajs/react';
import { Pen, Trash } from 'lucide-react';

export default function Show({ course }: { course: Course }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Course',
            href: index().url,
        },
        {
            title: course.title,
            href: show(course).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Course" />
            <DashboardContainer>
                <DashboardHeader header={`Show Course ${course.title} info`}>
                    <CourseActions course={course} />
                </DashboardHeader>
                <DataContainer>
                    <CourseMeta course={course} />
                    <SectionsInfo course={course} />
                    <SpacesInfo course={course} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function SpacesInfo({ course }: { course: Course }) {
    return (
        <>
            <DashboardHeader header={`Space info`} containerClassName="my-4">
                <SpaceActions course={course} />
            </DashboardHeader>
            <SpacesMeta course={course} />
            {!!course.spaces && course.spaces?.length > 0 && (
                <ResponsiveSpaceList spaces={course.spaces} />
            )}
        </>
    );
}

function ResponsiveSpaceList({ spaces }: { spaces: Space[] }) {
    return (
        <ResponsiveDataList
            data={spaces}
            columns={[
                { header: 'ID', cell: (space) => space.id },
                { header: 'Space', cell: (space) => space.name },
                { header: 'Created At', cell: (space) => space.created_at },
                { header: 'Updated At', cell: (space) => space.updated_at },
            ]}
        />
    );
}

function SpacesMeta({ course }: { course: Course }) {
    return (
        <>
            <InfoBlock label="Spaces Count" value={course.spaces_count} />
        </>
    );
}

function SpaceActions({ course }: { course: Course }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={spaces(course).url}>Spaces</ButtonLink>
        </ActionButtonContainer>
    );
}

function SectionsInfo({ course }: { course: Course }) {
    return (
        <>
            <DashboardHeader header={`Section info`} containerClassName="my-4">
                <SectionActions course={course} />
            </DashboardHeader>
            <SectionsMeta course={course} />
            {!!course.sections && course.sections?.length > 0 && (
                <ResponsiveSectionList sections={course.sections} />
            )}
        </>
    );
}

function ResponsiveSectionList({ sections }: { sections: Section[] }) {
    return (
        <ResponsiveDataList
            data={sections}
            columns={[
                { header: 'ID', cell: (section) => section.id },
                { header: 'Section', cell: (section) => section.name },
                { header: 'Created At', cell: (section) => section.created_at },
                { header: 'Updated At', cell: (section) => section.updated_at },
            ]}
        />
    );
}

function SectionsMeta({ course }: { course: Course }) {
    return (
        <>
            <InfoBlock label="Sections Count" value={course.sections_count} />
        </>
    );
}

function SectionActions({ course }: { course: Course }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={sections(course).url}>Sections</ButtonLink>
        </ActionButtonContainer>
    );
}

function CourseMeta({ course }: { course: Course }) {
    console.log(course);
    
    return (
        <>
            <InfoBlock label="ID" value={course.id} />
            <InfoBlock label="Teacher ID" value={course.teacher.user?.id} />
            <InfoBlock label="Teacher Name" value={course.teacher.user?.name} />
            <InfoBlock label="Created At" value={course.created_at} />
            <InfoBlock label="Updated At" value={course.updated_at} />
        </>
    );
}

function CourseActions({ course }: { course: Course }) {
    return (
        <ActionButtonContainer>
            {!!course.sections_count && (
                <FormButton
                    className="inline"
                    form={destroy.form(course)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={edit(course).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}
