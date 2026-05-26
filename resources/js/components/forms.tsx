import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import user_links from "@/routes/admin/user";
import student_links from "@/routes/admin/student";
import wallet_links from "@/routes/admin/wallet";
import teacher_links from "@/routes/admin/teacher";
import course_links from "@/routes/admin/course";
import plan_links from "@/routes/admin/plan";
import section_links from "@/routes/admin/section";
import lesson_links from "@/routes/admin/lesson";
import content_links from "@/routes/admin/content";
import enrollment_links from "@/routes/admin/enrollment";
import { Content, Course, Enrollment, Lesson, Plan, Section, Student, Teacher, User, Wallet } from "@/types";
import { Form, router } from "@inertiajs/react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import slugify from 'slugify';
import { Pen, X } from "lucide-react";

export function WalletOrderForm({ wallet }: { wallet: Wallet}){
    return(
        <Form
            {...wallet_links.order.store.form(wallet)}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select 
                                id="status"
                                tabIndex={1}
                                name="status"
                                required
                                autoFocus
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {['pending', 'paid'].map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors.status}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function CourseForm({ type, teachers, course }: { type: "create" | "edit", teachers: Teacher[], course?: Course }){
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
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="teacher">Teacher</Label>
                                <Combobox items={teachers} name="teacher_id" defaultValue={course?.teacher_id}>
                                    <ComboboxInput placeholder="Select a teacher" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                            <ComboboxItem key={item.id} value={item.id}>
                                                {item.id}.{item.user?.name}
                                            </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError
                                    message={errors.teacher_id}
                                    className="mt-2"
                                />
                            </div>
                            <div className="grid gap-2">
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
                            </div>

                            <div className="grid gap-2">
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
                            </div>

                            <div className="grid gap-2">
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
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>

                                <Select name="status" tabIndex={5} defaultValue={course?.status}>
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
                                <Label htmlFor="description">Description</Label>

                                <Textarea
                                    id="description"
                                    name="description"
                                    tabIndex={6}
                                    defaultValue={course?.description}
                                    placeholder="Description"
                                />

                                <InputError message={errors.description} />
                            </div>

                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={7}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function ContentForm({ type, lessons, content }: { type: "create" | "edit", lessons: Lesson[], content?: Content }){
    const form = (type === 'create')? content_links.store.form(): content_links.update.form(content?? 0);
    
    return(
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(content_links.index().url)}
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="lesson">Lesson</Label>
                                <Combobox items={lessons} name="lesson_id" defaultValue={content?.lesson_id}>
                                    <ComboboxInput placeholder="Select a lesson" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                            <ComboboxItem key={item.id} value={item.id}>
                                                {item.id}.{item.name} - {item.section?.name} - {item.section?.course?.title} - {item.section?.course?.teacher?.user?.name}
                                            </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError
                                    message={errors.lesson_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Body</Label>

                                <Textarea
                                    id="body"
                                    name="body"
                                    tabIndex={1}
                                    defaultValue={content?.body}
                                    placeholder="Body"
                                />

                                <InputError message={errors.body} />
                            </div>

                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={3}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function LessonForm({ type, sections, lesson }: { type: "create" | "edit", sections: Section[], lesson?: Lesson }){
    const form = (type === 'create')? lesson_links.store.form(): lesson_links.update.form(lesson?? 0);
    
    return(
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(lesson_links.index().url)}
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="section">Teacher</Label>
                                <Combobox items={sections} name="section_id" defaultValue={lesson?.section_id}>
                                    <ComboboxInput placeholder="Select a section" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                            <ComboboxItem key={item.id} value={item.id}>
                                                {item.id}.{item.name} - {item.course?.title} - {item.course?.teacher?.user?.name}
                                            </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError
                                    message={errors.section_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    type="text"
                                    tabIndex={1}
                                    autoFocus
                                    name="name"
                                    defaultValue={lesson?.name}
                                    placeholder="Name"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={3}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function SectionForm({ type, courses, section }: { type: "create" | "edit", courses: Course[], section?: Section }){
    const form = (type === 'create')? section_links.store.form(): section_links.update.form(section?? 0);
    
    return(
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(section_links.index().url)}
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="course">Teacher</Label>
                                <Combobox items={courses} name="course_id" defaultValue={section?.course_id}>
                                    <ComboboxInput placeholder="Select a course" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                            <ComboboxItem key={item.id} value={item.id}>
                                                {item.id}.{item.title} - {item.teacher?.user?.name}
                                            </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError
                                    message={errors.course_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    type="text"
                                    tabIndex={1}
                                    autoFocus
                                    name="name"
                                    defaultValue={section?.name}
                                    placeholder="Name"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={3}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function PlanForm({ type, courses, plan }: { type: "create" | "edit", courses: Course[], plan?: Plan }){
    const form = (type === 'create')? plan_links.store.form(): plan_links.update.form(plan?? 0);
    
    return(
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(plan_links.index().url)}
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="course">Teacher</Label>
                                <Combobox items={courses} name="course_id" defaultValue={plan?.course_id}>
                                    <ComboboxInput placeholder="Select a course" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                            <ComboboxItem key={item.id} value={item.id}>
                                                {item.id}.{item.title} - {item.teacher?.user?.name}
                                            </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError
                                    message={errors.course_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    type="text"
                                    tabIndex={1}
                                    autoFocus
                                    name="name"
                                    defaultValue={plan?.name}
                                    placeholder="Name"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>

                                <Input
                                    id="price"
                                    type="number"
                                    step={1000}
                                    name="price"
                                    tabIndex={2}
                                    defaultValue={plan?.price}
                                    placeholder="Price"
                                />

                                <InputError message={errors.price} />
                            </div>

                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={3}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function SectionLessonForm({ section }: { section: Section}){ 
    return(
        <Form
            {...section_links.lesson.store.form(section)}
            disableWhileProcessing
            onSuccess={() => router.visit(section_links.lesson.index(section).url) }
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    type="text"
                                    tabIndex={3}
                                    name="name"
                                    placeholder="Name"
                                />

                                <InputError message={errors.name} />
                            </div>
                        
                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={7}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function LessonContentForm({ lesson }: { lesson: Lesson}){ 
    return(
        <Form
            {...lesson_links.content.store.form(lesson)}
            disableWhileProcessing
            onSuccess={() => router.visit(lesson_links.content.index(lesson).url) }
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Body</Label>

                                <Textarea
                                    id="body"
                                    name="body"
                                    tabIndex={1}
                                    placeholder="Body"
                                />

                                <InputError message={errors.body} />
                            </div>
                        
                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={2}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function CourseSectionForm({ course }: { course: Course}){ 
    return(
        <Form
            {...course_links.section.store.form(course)}
            disableWhileProcessing
            onSuccess={() => router.visit(course_links.section.index(course).url) }
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    type="text"
                                    tabIndex={3}
                                    name="name"
                                    placeholder="Name"
                                />

                                <InputError message={errors.name} />
                            </div>
                        
                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={7}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function CoursePlanForm({ course }: { course: Course}){ 
    return(
        <Form
            {...course_links.plan.store.form(course)}
            disableWhileProcessing
            onSuccess={() => router.visit(course_links.plan.index(course).url) }
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    type="text"
                                    tabIndex={3}
                                    name="name"
                                    placeholder="Name"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>

                                <Input
                                    id="price"
                                    type="number"
                                    step={1000}
                                    name="price"
                                    tabIndex={4}
                                    placeholder="Price"
                                />

                                <InputError message={errors.price} />
                            </div>
                        
                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={7}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function TeacherCourseForm({ teacher }: { teacher: Teacher}){
    const [slugTouched, setSlugTouched] = useState(false);
    const [slug, setSlug] = useState("");
 
    return(
        <Form
            {...teacher_links.course.store.form(teacher, { mergeQuery: { slug: slug } })}
            disableWhileProcessing
            onError={(errors) => (errors.slug == 'The slug has already been taken.') && setSlugTouched(true)}
            className="flex flex-col mt-4 gap-4"
        >
            {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>

                                <Input
                                    id="title"
                                    type="text"
                                    name="title"
                                    tabIndex={1}
                                    autoFocus
                                    onChange={e => (!slugTouched) && setSlug(slugify(e.target.value, { lower: true }))}
                                    placeholder="Title"
                                />

                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
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
                                <Label htmlFor="thumbnail">Thumbnail</Label>

                                <Input
                                    id="thumbnail"
                                    type="text"
                                    tabIndex={3}
                                    name="thumbnail"
                                    placeholder="Thumbnail"
                                />

                                <InputError message={errors.thumbnail} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="intro_video_url">Intro Video Url</Label>

                                <Input
                                    id="intro_video_url"
                                    type="text"
                                    name="intro_video_url"
                                    tabIndex={4}
                                    placeholder="Intro Video Url"
                                />

                                <InputError message={errors.intro_video_url} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>

                                <Select name="status" tabIndex={5}>
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
                                <Label htmlFor="description">Description</Label>

                                <Textarea
                                    id="description"
                                    name="description"
                                    tabIndex={6}
                                    placeholder="Description"
                                />

                                <InputError message={errors.description} />
                            </div>

                            <div className="mt-2 text-end">
                                <Button
                                    type="submit"
                                    tabIndex={7}
                                >
                                    {processing && <Spinner />}
                                    Submit
                                </Button>
                            </div>
                        </>
                    )}
        </Form>
    );
}

export function StudentEnrollmentForm({ student, plans }: { student: Student, plans: Plan[] }){
    return(
        <Form
            {...student_links.enrollment.store.form(student)}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="plan_id">Plan</Label>
                            <Combobox items={plans} name="plan_id">
                                <ComboboxInput placeholder="Select a plan" />
                                <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                    <ComboboxItem key={item.id} value={item.id}>
                                        {item.id}.{item.course?.title} - {item.name} - {item.course?.teacher?.user?.name}
                                    </ComboboxItem>
                                    )}
                                </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <InputError
                                message={errors.plan_id}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function EnrollmentForm({ type, students, plans, enrollment }: { type: "create" | "edit", students: Student[], plans: Plan[], enrollment?: Enrollment }){
    const form = (type === 'create')? enrollment_links.store.form(): enrollment_links.update.form(enrollment?? 0);
    
    return(
        <Form
            {...form}
            disableWhileProcessing
            onSuccess={() => router.visit(enrollment_links.index().url)}
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="student_id">Student</Label>
                            <Combobox items={students} name="student_id" defaultValue={enrollment?.student_id}>
                                <ComboboxInput placeholder="Select a student" />
                                <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                    <ComboboxItem key={item.id} value={item.id}>
                                        {item.id}.{item.user?.name}
                                    </ComboboxItem>
                                    )}
                                </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <InputError
                                message={errors.student_id}
                                className="mt-2"
                            />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="plan_id">Plan</Label>
                            <Combobox items={plans} name="plan_id" defaultValue={enrollment?.plan_id}>
                                <ComboboxInput placeholder="Select a plan" />
                                <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                    <ComboboxItem key={item.id} value={item.id}>
                                        {item.id}.{item.course?.title} - {item.name} - {item.course?.teacher?.user?.name}
                                    </ComboboxItem>
                                    )}
                                </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            <InputError
                                message={errors.plan_id}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function WalletForm({ type, wallet, users }: { type: "create" | "edit", wallet?: Wallet, users: User[] }){
    const form = (type === 'create')? wallet_links.store.form(): wallet_links.update.form(wallet?? 0);

    return(
        <Form
            {...form}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="user">User</Label>
                            <UserSelect users={users}  default_user={wallet?.user} /> 
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function StudentForm({ type, student, users }: { type: "create" | "edit", student?: Student, users: User[] }){
    const form = (type === 'create')? student_links.store.form(): student_links.update.form(student?? 0);

    return(
        <Form
            {...form}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="user">User</Label>
                            <UserSelect users={users}  default_user={student?.user} /> 
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function TeacherForm({ type, teacher, users }: { type: "create" | "edit", teacher?: Teacher, users: User[] }){
    const form = (type === 'create')? teacher_links.store.form(): teacher_links.update.form(teacher?? 0);

    return(
        <Form
            {...form}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="user">User</Label>
                            <UserSelect users={users} default_user={teacher?.user} /> 
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={2}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function UserForm({ type, user }: { type: "create" | "edit", user?: User }){
    const form = (type === 'create')? user_links.store.form(): user_links.update.form(user?? 0);

    return(
        <Form
            {...form}
            disableWhileProcessing
            className="flex flex-col mt-4"
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                name="name"
                                defaultValue={user?.name}
                                placeholder="Full name"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                name="email"
                                defaultValue={user?.email}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="mt-2 text-end">
                            <Button
                                type="submit"
                                tabIndex={3}
                            >
                                {processing && <Spinner />}
                                Submit
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

export function UserSelect({ users, default_user }: { users: User[], default_user?: User }){
    return (
        <Combobox items={users} name="user_id" defaultValue={default_user?.id}>
            <ComboboxInput placeholder="Select a user" />
            <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
                {(item) => (
                <ComboboxItem key={item.id} value={item.id}>
                    {item.id}.{item.name}
                </ComboboxItem>
                )}
            </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

