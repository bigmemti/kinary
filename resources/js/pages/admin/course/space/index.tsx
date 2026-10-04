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
import { show as course_show, index } from '@/routes/admin/course';
import { create, index as spaces } from '@/routes/admin/course/space';
import { destroy, edit, show } from '@/routes/admin/space';
import { BreadcrumbItem, Course, Space } from '@/types';
import { Head } from '@inertiajs/react';
import { index as plans } from '@/routes/admin/space/plan';
import { Eye, Layers, Pen, Trash } from 'lucide-react';

export default function Index({ course }: { course: Course }) {
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
            href: course_show(course).url,
        },
        {
            title: 'Spaces',
            href: spaces(course).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course List" />
            <DashboardContainer>
                <DashboardHeader header={`Course ${course.title} Spaces List`}>
                    <CreateHeaderButton
                        href={create(course).url}
                        model="space"
                    />
                </DashboardHeader>
                {!!course.spaces && course.spaces?.length > 0 && (
                    <ResponsiveSpaceList spaces={course.spaces} />
                )}
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveSpaceList({ spaces }: { spaces: Space[] }) {
    return (
        <ResponsiveDataList
            data={spaces}
            columns={[
                { header: 'ID', cell: (space) => space.id },
                { header: 'Space', cell: (space) => space.name },
                {
                    header: 'Plan Count',
                    cell: (space) => space.plans_count,
                },
                { header: 'Created At', cell: (space) => space.created_at },
                { header: 'Updated At', cell: (space) => space.updated_at },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (space) => <SpaceActions space={space} />,
                },
            ]}
        />
    );
}

function SpaceActions({ space }: { space: Space }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            {!(space.plans_count) && (
                <FormButton
                    className="inline"
                    form={destroy.form(space)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={plans(space).url}>
                <Layers />
            </ButtonLink>
            <ButtonLink href={edit(space).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(space).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
