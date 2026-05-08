import ButtonLink from '@/components/button-link';
import { DashboardContainer } from '@/components/dashboard';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { destroy, index, show, store } from '@/routes/course';
import { Course, type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { Eye, Pen, Plus, Trash, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import slugify from 'slugify'


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

export default function Index({ courses }: { courses: Course[]}) {
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

function CourseCardsContainer({ courses }: { courses: Course[]}){
    return(
        <CardContainer> 
            <HeaderCard>
                <div className='flex-1 flex gap-4'>
                    <span className='flex-1'>Course</span>
                    <span>Status</span>
                </div>
                <div>Actions</div>
            </HeaderCard>
            {courses.map(course => ( 
                <CourseCard key={course.id}> 
                    <div className='flex-1 flex gap-4'>
                        <span className='flex-1'>{course.title}</span>
                        <span>{course.status}</span>
                    </div>
                    <div className='flex gap-2'>
                        <CourseShowButton course={course} />
                        <CourseDeleteButton course={course} />
                    </div>
                </CourseCard> 
            ))}
        </CardContainer>
    );
}

function CourseDeleteButton({ course }: { course: Course }) {
    return(
        <Form {...destroy.form(course)} options={{ preserveScroll: true }}>
            <Button variant='destructive'>
                <Trash />
            </Button>
        </Form>
    );
}

function CourseShowButton({ course }: { course: Course}) {
    return(
        <ButtonLink href={show(course).url}>
            <Eye />
        </ButtonLink>
    );
}

function CourseCard({ children }: PropsWithChildren){
    return(
        <Card className='px-4 flex-row'>
            {children}
        </Card>
    );
}

function HeaderCard({ children }: PropsWithChildren) {
    return(
        <Card className='hidden lg:flex px-4 flex-row'>
            {children}
        </Card>
    );
}

function CardContainer({ children }: PropsWithChildren){
    return(
        <div className='grid md:grid-cols-2 lg:grid-cols-1 gap-4'>
            {children}
        </div>
    );
}

function CourseCreateDialog(){
    const [open, setOpen] = useState(false);
    const [slugTouched, setSlugTouched] = useState(false);
    const [slug, setSlug] = useState("");

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='self-end' onClick={() => setOpen(true)}>
                    Create new course <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>
                    Create a new Course.
                </DialogTitle>

                <Form
                    {...store.form({ mergeQuery: { slug: slug } })}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnSuccess
                    onSuccess={() => {setOpen(false); setSlugTouched(false); setSlug('')}}
                    onError={(errors) => (errors.slug == 'The slug has already been taken.') && setSlugTouched(true)}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="title"
                                    className="sr-only"
                                >
                                    Title
                                </Label>

                                <Input
                                    id="title"
                                    type="text"
                                    name="title"
                                    onChange={e => (!slugTouched) && setSlug(slugify(e.target.value, { lower: true }))}
                                    placeholder="Title"
                                />

                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="slug"
                                    className="sr-only"
                                >
                                    Slug
                                </Label>

                                <div className='flex'>
                                    <Input
                                        id="slug"
                                        type="text"
                                        name="slug"
                                        value={slug}
                                        placeholder="Slug"
                                        disabled={!slugTouched}
                                        onChange={e => setSlug(slugify(e.target.value))}
                                    />

                                    <Button 
                                        variant={'ghost'} 
                                        type='button' 
                                        onClick={(e) =>  setSlugTouched(v => !v)}
                                    >
                                        {slugTouched 
                                            ? <X /> 
                                            : <Pen />
                                        }
                                    </Button>
                                </div>

                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="thumbnail"
                                    className="sr-only"
                                >
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
                                <Label
                                    htmlFor="status"
                                    className="sr-only"
                                >
                                    Status
                                </Label>

                                <Select name="status">
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
                                <Button
                                    disabled={processing}
                                    asChild
                                >
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

