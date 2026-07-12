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
import { destroy, edit, index, show } from '@/routes/admin/teacher';
import { index as courses } from '@/routes/admin/teacher/course';
import { BreadcrumbItem, Course, Teacher } from '@/types';
import { Head } from '@inertiajs/react';
import { Pen, Trash } from 'lucide-react';

export default function Show({ teacher }: { teacher: Teacher }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Teacher',
            href: index().url,
        },
        {
            title: teacher.user?.name ?? teacher.id.toString(),
            href: show(teacher).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show Teacher" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Show Teacher ${teacher.user?.name ?? teacher.id} info`}
                >
                    <TeacherActions teacher={teacher} />
                </DashboardHeader>
                <DataContainer>
                    <TeacherMeta teacher={teacher} />
                    <CoursesInfo teacher={teacher} />
                </DataContainer>
            </DashboardContainer>
        </AppLayout>
    );
}

function CoursesInfo({ teacher }: { teacher: Teacher }) {
    return (
        <>
            <DashboardHeader header={`Course info`} containerClassName="my-4">
                <CourseActions teacher={teacher} />
            </DashboardHeader>
            <CoursesMeta teacher={teacher} />
            {!!teacher.courses && teacher.courses?.length > 0 && (
                <ResponsiveCourseList courses={teacher.courses} />
            )}
        </>
    );
}

function ResponsiveCourseList({ courses }: { courses: Course[] }) {
    return (
        <ResponsiveDataList
            data={courses}
            columns={[
                { header: 'ID', cell: (course) => course.id },
                { header: 'Course', cell: (course) => course.title },
                { header: 'Created At', cell: (course) => course.created_at },
                { header: 'Updated At', cell: (course) => course.updated_at },
            ]}
        />
    );
}

function CoursesMeta({ teacher }: { teacher: Teacher }) {
    return (
        <>
            <InfoBlock label="Courses Count" value={teacher.courses_count} />
        </>
    );
}

function CourseActions({ teacher }: { teacher: Teacher }) {
    return (
        <ActionButtonContainer>
            <ButtonLink href={courses(teacher).url}>Courses</ButtonLink>
        </ActionButtonContainer>
    );
}

function TeacherMeta({ teacher }: { teacher: Teacher }) {
    return (
        <>
            <InfoBlock label="ID" value={teacher.id} />
            <InfoBlock label="User ID" value={teacher.user?.id} />
            <InfoBlock label="User Name" value={teacher.user?.name} />
            <InfoBlock label="Created At" value={teacher.created_at} />
            <InfoBlock label="Updated At" value={teacher.updated_at} />
        </>
    );
}

function TeacherActions({ teacher }: { teacher: Teacher }) {
    return (
        <ActionButtonContainer>
            {!!teacher.courses_count && (
                <FormButton
                    className="inline"
                    form={destroy.form(teacher)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={edit(teacher).url}>
                <Pen />
            </ButtonLink>
        </ActionButtonContainer>
    );
}
