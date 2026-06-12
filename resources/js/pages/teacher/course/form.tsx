import { Course, WithType } from "@/types";
import course_links from "@/routes/teacher/course";
import { useState } from "react";
import { Form } from "@inertiajs/react";
import { FieldContainer, FormContainer, SubmitButton } from "@/components/forms";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import slugify from 'slugify';
import { Button } from "@/components/ui/button";
import { Pen, X } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CourseForm({ type, course }: WithType<{ course?: Course }>){
    const [slugTouched, setSlugTouched] = useState(type === 'edit');
    const [slug, setSlug] = useState(course?.slug ?? "");
    const form = (type === 'create')? course_links.store.form({ mergeQuery: { slug: slug } }): course_links.update.form(course?? 0, { mergeQuery: { slug: slug } });
    
    return(
        <Form
            {...form}
            disableWhileProcessing
            onError={(errors) => (errors.slug == 'The slug has already been taken.') && setSlugTouched(true)}
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                <FormContainer>
                    <FieldContainer>
                        <Label htmlFor="title">Title</Label>

                        <Input
                            id="title"
                            type="text"
                            name="title"
                            tabIndex={1}
                            autoFocus
                            defaultValue={course?.title}
                            onChange={e => (!slugTouched) && setSlug(slugify(e.target.value, { lower: true }))}
                            placeholder="Title"
                        />

                        <InputError message={errors.title} />
                    </FieldContainer>

                    <FieldContainer>
                        <Label htmlFor="slug">Slug</Label>

                        <div className='flex'>
                            <Input
                                id="slug"
                                type="text"
                                name="slug"
                                value={slug}
                                tabIndex={2}
                                placeholder="Slug"
                                disabled={!slugTouched}
                                onChange={e => setSlug(slugify(e.target.value))}
                            />

                            <Button 
                                variant={'ghost'} 
                                type='button' 
                                onClick={() =>  setSlugTouched(v => !v)}
                            >
                                {slugTouched 
                                    ? <X /> 
                                    : <Pen />
                                }
                            </Button>
                        </div>

                        <InputError message={errors.slug} />
                    </FieldContainer>

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
                        <Label htmlFor="intro_video_url">Intro Video Url</Label>

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

                    <FieldContainer>
                        <Label htmlFor="status">Status</Label>

                        <Select name="status" defaultValue={course?.status}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="published">published</SelectItem>
                                    <SelectItem value="draft">draft</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <InputError message={errors.status} />
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