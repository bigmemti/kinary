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
import { create, destroy, edit, index, show } from '@/routes/admin/lesson';
import { index as contents } from '@/routes/admin/lesson/content';
import { BreadcrumbItem, Lesson } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, Pen, ReceiptText, Trash } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Lesson',
        href: index().url,
    },
];

export default function Index({ lessons }: { lessons: Lesson[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lesson List" />
            <DashboardContainer>
                <DashboardHeader header="Lesson List">
                    <CreateHeaderButton href={create().url} model="lesson" />
                </DashboardHeader>
                <ResponsiveLessonList lessons={lessons} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveLessonList({ lessons }: { lessons: Lesson[] }) {
    return (
        <ResponsiveDataList
            data={lessons}
            columns={[
                { header: 'ID', cell: (lesson) => lesson.id },
                {
                    header: 'Course',
                    cell: (lesson) => lesson.section?.course?.title,
                },
                {
                    header: 'Teacher',
                    cell: (lesson) =>
                        lesson.section?.course?.teacher?.user?.name,
                },
                { header: 'Section', cell: (lesson) => lesson.section?.name },
                { header: 'Lesson', cell: (lesson) => lesson.name },
                {
                    header: 'Content Count',
                    cell: (lesson) => lesson.contents_count,
                },
                {
                    header: (
                        <div className="inline text-end xl:block">Actions</div>
                    ),
                    cell: (lesson) => <LessonActions lesson={lesson} />,
                },
            ]}
        />
    );
}

function LessonActions({ lesson }: { lesson: Lesson }) {
    return (
        <div className="mt-2 space-x-2 text-center xl:mt-1 xl:text-end">
            {!lesson.contents_count && (
                <FormButton
                    className="inline"
                    form={destroy.form(lesson)}
                    options={{ preserveScroll: true }}
                >
                    <Trash />
                </FormButton>
            )}
            <ButtonLink href={contents(lesson).url}>
                <ReceiptText />
            </ButtonLink>
            <ButtonLink href={edit(lesson).url}>
                <Pen />
            </ButtonLink>
            <ButtonLink href={show(lesson).url}>
                <Eye />
            </ButtonLink>
        </div>
    );
}
