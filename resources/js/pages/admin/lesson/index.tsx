import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Lesson } from "@/types";
import ButtonLink from "@/components/button-link";
import FormButton from "@/components/form-button";
import { Eye, ReceiptText, Pen, Trash  } from "lucide-react";
import ResponsiveDataList from "@/components/responsive-data-list";
import { index as contents } from "@/routes/admin/lesson/content";
import { create, destroy, edit, index, show } from "@/routes/admin/lesson";
import { CreateHeaderButton, DashboardContainer, DashboardHeader } from "@/components/dashboard";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url
    },
    {
        title: 'Lesson',
        href: index().url
    }
];

export default function Index({ lessons }: { lessons: Lesson[] }){
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <Head title="Lesson List"/>
            <DashboardContainer>
                <DashboardHeader header="Lesson List">
                    <CreateHeaderButton href={create().url} model="lesson" />
                </DashboardHeader>
                <ResponsiveLessonList lessons={lessons} />
            </DashboardContainer>
        </AppLayout>
    );
}

function ResponsiveLessonList({ lessons }: { lessons: Lesson[]}) {
    return (
        <ResponsiveDataList
            data={lessons}
            columns={[
                { header: "ID", cell: (lesson) => lesson.id, },
                { header: "Course", cell: (lesson) => lesson.section?.course?.title, },
                { header: "Teacher", cell: (lesson) => lesson.section?.course?.teacher?.user?.name, },
                { header: "Section", cell: (lesson) => lesson.section?.name, },
                { header: "Lesson", cell: (lesson) => lesson.name, },
                { header: "Content Count", cell: (lesson) => lesson.contents_count, },
                { header: <div className="text-end inline xl:block">Actions</div>, cell: (lesson) => <LessonActions lesson={lesson} /> },
            ]}
        />
    );
}

function LessonActions({ lesson }: { lesson: Lesson}) {
    return (
        <div className="space-x-2 text-center xl:text-end mt-2 xl:mt-1">
            {!lesson.contents_count && (
                    <FormButton className="inline" form={destroy.form(lesson)} options={{ preserveScroll: true }}>
                        <Trash />
                    </FormButton>
                )
            }
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