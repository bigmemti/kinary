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
import { destroy, edit, show } from '@/routes/admin/course';
import { index as plans } from '@/routes/admin/course/plan';
import { index, show as teacher_show } from '@/routes/admin/teacher';
import { index as courses, create } from '@/routes/admin/teacher/course';
import { BreadcrumbItem, Course, Teacher } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, Layers, Pen, Trash } from 'lucide-react';

export default function Index({ teacher }: { teacher: Teacher }) {
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
            title: teacher.user?.name || teacher.id.toString(),
            href: teacher_show(teacher).url,
        },
        {
            title: 'Courses',
            href: courses(teacher).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher List" />
            <DashboardContainer>
                <DashboardHeader
                    header={`Teacher ${teacher.user?.name} Courses List`}
                >
                    <CreateHeaderButton
                        href={create(teacher).url}
                        model="course"
                    />
                </DashboardHeader>
                {!!teacher.courses && teacher.courses?.length > 0 && (
                    <ResponsiveCourseList courses={teacher.courses} />
                )}
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
                { header: 'Created At', cell: (course) => course.created_at },
                { header: 'Updated At', cell: (course) => course.updated_at },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (course) => <CourseActions course={course} />,
                },
            ]}
        />
    );
}

function CourseActions({ course }: { course: Course }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            {!course.plans_count ? (
                <FormButton
                    className="inline"
                    form={destroy.form(course)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            ) : (
                <ButtonLink href={plans(course).url}>
                    <Layers />
                </ButtonLink>
            )}
            <ButtonLink href={edit(course).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(course).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
