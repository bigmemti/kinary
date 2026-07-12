import ButtonLink from '@/components/button-link';
import {
    ActionsHeader,
    CreateHeaderButton,
    DashboardContainer,
    DashboardHeader,
} from '@/components/dashboard';
import FormButton from '@/components/form-button';
import ResponsiveDataList from '@/components/responsive-data-list';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { create, destroy, edit, index, show } from '@/routes/teacher/course';
import { index as plans } from '@/routes/teacher/course/plan';
import { index as sections } from '@/routes/teacher/course/section';
import { BreadcrumbItem, Course } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, Layers, Pen, TableRowsSplit, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Course',
        href: index().url,
    },
];

export default function Index({ courses }: { courses: Course[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course List" />
            <DashboardContainer>
                <DashboardHeader header="Course List">
                    <CreateHeaderButton href={create().url} model="course" />
                </DashboardHeader>
                <ResponsiveCourseList courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveCourseList({ courses }: { courses: Course[] }) {
    return (
        <ResponsiveDataList
            data={courses}
            columns={[
                { header: 'ID', cell: (course) => course.id },
                { header: 'Course', cell: (course) => course.title },
                { header: 'Plan Count', cell: (course) => course.plans_count },
                {
                    header: 'Section Count',
                    cell: (course) => course.sections_count,
                },
                {
                    header: <ActionsHeader />,
                    cell: (course) => <CourseActions course={course} />,
                },
            ]}
        />
    );
}

function CourseActions({ course }: { course: Course }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            {!(course.plans_count || course.sections_count) && (
                <FormButton
                    className="inline"
                    form={destroy.form(course)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={sections(course).url}>
                <TableRowsSplit />
            </ButtonLink>
            <ButtonLink href={plans(course).url}>
                <Layers />
            </ButtonLink>
            <ButtonLink href={edit(course).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(course).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
