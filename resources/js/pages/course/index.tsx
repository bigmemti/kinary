import ButtonLink from '@/components/button-link';
import { DashboardContainer } from '@/components/dashboard';
import FormButton from '@/components/form-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RichTextEditor as Textarea } from '@/components/rich-text-editor';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { destroy, index, show, store } from '@/routes/admin/course';
import { Course, type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { Eye, Plus, Trash } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Course List',
        href: index().url,
    },
];

export default function Index({ courses }: { courses: Course[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course List" />
            <DashboardContainer>
                <CourseCreateDialog />
                <CourseCardsContainer courses={courses} />
            </DashboardContainer>
        </AppLayout>
    );
}

function CourseCardsContainer({ courses }: { courses: Course[] }) {
    return (
        <CardContainer>
            <HeaderCard>
                <div className="flex flex-1 gap-4">
                    <span className="flex-1">Course</span>
                    <span>Status</span>
                </div>
                <div>Actions</div>
            </HeaderCard>
            {courses.map((course) => (
                <CourseCard key={course.id}>
                    <div className="flex flex-1 gap-4">
                        <span className="flex-1">{course.title}</span>
                        <span>{course.status}</span>
                    </div>
                    <div className="flex gap-2">
                        <CourseShowButton course={course} />
                        <CourseDeleteButton course={course} />
                    </div>
                </CourseCard>
            ))}
        </CardContainer>
    );
}

function CourseDeleteButton({ course }: { course: Course }) {
    return (
        <FormButton
            form={destroy.form(course)}
            options={{ preserveScroll: true }}
        >
            <Trash />
        </FormButton>
    );
}

function CourseShowButton({ course }: { course: Course }) {
    return (
        <ButtonLink href={show(course).url}>
            <Eye />
        </ButtonLink>
    );
}

function CourseCard({ children }: PropsWithChildren) {
    return <Card className="flex-row px-4">{children}</Card>;
}

function HeaderCard({ children }: PropsWithChildren) {
    return <Card className="hidden flex-row px-4 lg:flex">{children}</Card>;
}

function CardContainer({ children }: PropsWithChildren) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {children}
        </div>
    );
}

function CourseCreateDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="self-end" onClick={() => setOpen(true)}>
                    Create new course <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>Create a new Course.</DialogTitle>

                <Form
                    {...store.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnSuccess
                    onSuccess={() => {
                        setOpen(false);
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="sr-only">
                                    Title
                                </Label>

                                <Input
                                    id="title"
                                    type="text"
                                    name="title"
                                    placeholder="Title"
                                />

                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug" className="sr-only">
                                    شناسه متنی
                                </Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    placeholder="?? ???? ???? ????? ?? شناسه متنی? ??????"
                                />

                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="thumbnail" className="sr-only">
                                    Thumbnail
                                </Label>

                                <Input
                                    id="thumbnail"
                                    type="text"
                                    name="thumbnail"
                                    placeholder="Thumbnail"
                                />

                                <InputError message={errors.thumbnail} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="intro_video_url"
                                    className="sr-only"
                                >
                                    Intro Video Url
                                </Label>

                                <Input
                                    id="intro_video_url"
                                    type="text"
                                    name="intro_video_url"
                                    placeholder="Intro Video Url"
                                />

                                <InputError message={errors.intro_video_url} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status" className="sr-only">
                                    Status
                                </Label>

                                <Select name="status">
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="published">
                                                published
                                            </SelectItem>
                                            <SelectItem value="draft">
                                                draft
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="description"
                                    className="sr-only"
                                >
                                    Description
                                </Label>

                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Description"
                                />

                                <InputError message={errors.description} />
                            </div>

                            <DialogFooter className="gap-2">
                                <Button disabled={processing} asChild>
                                    <button
                                        type="submit"
                                        data-test="submit-course-create-button"
                                    >
                                        Store
                                    </button>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
