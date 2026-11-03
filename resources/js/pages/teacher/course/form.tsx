import {
    FieldContainer,
    FormContainer,
    SubmitButton,
} from '@/components/forms';
import InputError from '@/components/input-error';
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
import course_links from '@/routes/teacher/course';
import { Course, WithType } from '@/types';
import { Form, router } from '@inertiajs/react';

export default function CourseForm({
    type,
    visitOnSuccess = course_links.index().url,
    course,
    canPublish = true,
}: WithType<{
    course?: Course;
    visitOnSuccess?: string;
    canPublish?: boolean;
}>) {
    const form =
        type === 'create'
            ? course_links.store.form()
            : course_links.update.form(course ?? 0);

    return (
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(visitOnSuccess)}
            className="mt-4 flex flex-col gap-4"
        >
            {({ processing, errors }) => (
                <FormContainer>
                    <div className="grid gap-4 xl:grid-cols-2">
                        <FieldContainer>
                            <Label htmlFor="title">Title</Label>

                            <Input
                                id="title"
                                type="text"
                                name="title"
                                tabIndex={1}
                                autoFocus
                                defaultValue={course?.title}
                                placeholder="Title"
                            />

                            <InputError message={errors.title} />
                        </FieldContainer>

                        <FieldContainer>
                            <Label htmlFor="slug">شناسه متنی</Label>
                            <Input
                                id="slug"
                                name="slug"
                                defaultValue={course?.slug}
                                placeholder="?? ???? ???? ????? ?? شناسه متنی? ??????"
                            />

                            <InputError message={errors.slug} />
                        </FieldContainer>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <FieldContainer>
                            <Label htmlFor="thumbnail">Thumbnail</Label>

                            <Input
                                id="thumbnail"
                                type="text"
                                tabIndex={3}
                                name="thumbnail"
                                defaultValue={course?.thumbnail}
                                placeholder="Thumbnail"
                            />

                            <InputError message={errors.thumbnail} />
                        </FieldContainer>

                        <FieldContainer>
                            <Label htmlFor="intro_video_url">
                                Intro Video Url
                            </Label>

                            <Input
                                id="intro_video_url"
                                type="text"
                                name="intro_video_url"
                                tabIndex={4}
                                defaultValue={course?.intro_video_url}
                                placeholder="Intro Video Url"
                            />

                            <InputError message={errors.intro_video_url} />
                        </FieldContainer>
                    </div>

                    <FieldContainer>
                        <Label htmlFor="course-publication">Status</Label>

                        <Select
                            name="is_published"
                            disabled={!canPublish}
                            defaultValue={course?.is_published ? '1' : '0'}
                        >
                            <SelectTrigger
                                id="course-publication"
                                className="w-full"
                            >
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="1">published</SelectItem>
                                    <SelectItem value="0">draft</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <InputError message={errors.is_published} />
                    </FieldContainer>

                    <FieldContainer>
                        <Label htmlFor="description">Description</Label>

                        <Textarea
                            id="description"
                            name="description"
                            tabIndex={6}
                            defaultValue={course?.description}
                            placeholder="Description"
                        />

                        <InputError message={errors.description} />
                    </FieldContainer>

                    <SubmitButton tabindex={7} processing={processing} />
                </FormContainer>
            )}
        </Form>
    );
}
